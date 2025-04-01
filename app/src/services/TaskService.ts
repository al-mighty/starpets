import { Task, TaskHistory } from '../models/task';
import { sequelize } from '../config/database';
import { Transaction, QueryTypes } from 'sequelize';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { randomUUID } from 'crypto';
import * as cron from 'node-cron';
import { activeTasksTotal } from '../config/metrics';
import { instanceConfig } from '../config/instances';

class TaskService {
  private instanceId: string;
  private cronJobs: Map<number, cron.ScheduledTask> = new Map();
  private checkLocksInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.instanceId = randomUUID();
  }

  async start() {
    await this.initTasks();
    this.startCheckingLocks();
    logger.info(`Task service started with instance ID: ${this.instanceId}`);
  }

  async stop() {
    if (this.checkLocksInterval) {
      clearInterval(this.checkLocksInterval);
    }

    for (const job of this.cronJobs.values()) {
      job.stop();
    }
    this.cronJobs.clear();

    // Обновляем метрику при остановке
    activeTasksTotal.set({ instance_id: instanceConfig.instanceNumber.toString() }, 0);

    // Освобождаем блокировки в PostgreSQL
    await this.releaseAllLocks();

    logger.info(`Task service stopped: ${this.instanceId}`);
  }

  private startCheckingLocks() {
    // Проверяем блокировки каждую минуту
    this.checkLocksInterval = setInterval(async () => {
      try {
        await this.checkAndReclaimLocks();
        // Обновляем метрику при проверке блокировок
        activeTasksTotal.set({ instance_id: instanceConfig.instanceNumber.toString() }, this.cronJobs.size);
        logger.info(`Updated active tasks metric: ${this.cronJobs.size} tasks for instance ${instanceConfig.instanceNumber}`);
      } catch (error) {
        logger.error('Failed to check locks:', error);
      }
    }, 60000);
  }

  private async initTasks() {
    try {
      // Получаем все задачи
      const tasks = await Task.findAll();
      logger.info(`Found ${tasks.length} tasks in database`);

      // Группируем задачи по интервалам
      const tasksByInterval = new Map<string, Task[]>();
      for (const task of tasks) {
        const tasks = tasksByInterval.get(task.interval) || [];
        tasks.push(task);
        tasksByInterval.set(task.interval, tasks);
      }

      logger.info(`Grouped tasks by intervals: ${Array.from(tasksByInterval.keys()).join(', ')}`);

      // Для каждого интервала берем только одну задачу
      for (const [interval, intervalTasks] of tasksByInterval) {
        // Сортируем задачи по id и берем первую
        const task = intervalTasks.sort((a, b) => a.id - b.id)[0];

        // Пытаемся получить блокировку для задачи
        const locked = await this.acquireLock(task.id);
        if (locked) {
          await this.scheduleTask(task);
          // Обновляем метрику при добавлении задачи
          activeTasksTotal.set({ instance_id: instanceConfig.instanceNumber.toString() }, this.cronJobs.size);
          logger.info(`Scheduled task ${task.id} and updated metric to ${this.cronJobs.size} for instance ${instanceConfig.instanceNumber}`);
        } else {
          logger.info(`Failed to acquire lock for task ${task.id}`);
        }
      }
    } catch (error) {
      logger.error('Failed to initialize tasks:', error);
      throw error;
    }
  }

  private async acquireLock(taskId: number): Promise<boolean> {
    try {
      // Пытаемся получить advisory lock в PostgreSQL
      const [result] = await sequelize.query(
        'SELECT pg_try_advisory_lock($1) as locked',
        {
          bind: [taskId],
          type: QueryTypes.SELECT
        }
      );

      const locked = (result as any).locked;

      if (locked) {
        // Если получили блокировку, обновляем информацию о задаче
        await Task.update(
          {
            is_running: true,
            running_instance: this.instanceId,
            started_at: new Date()
          },
          {
            where: {
              id: taskId,
              [Op.or]: [
                { running_instance: null },
                { running_instance: this.instanceId }
              ]
            }
          }
        );

        // Проверяем, что обновление прошло успешно
        const task = await Task.findByPk(taskId);
        if (!task || task.running_instance !== this.instanceId) {
          // Если не удалось обновить, освобождаем блокировку
          await this.releaseLock(taskId);
          return false;
        }
      }

      return locked;
    } catch (error) {
      logger.error(`Failed to acquire lock for task ${taskId}:`, error);
      return false;
    }
  }

  private async releaseLock(taskId: number) {
    try {
      // Освобождаем advisory lock в PostgreSQL
      await sequelize.query(
        'SELECT pg_advisory_unlock($1)',
        {
          bind: [taskId]
        }
      );

      await Task.update(
        {
          is_running: false,
          running_instance: null
        },
        {
          where: {
            id: taskId,
            running_instance: this.instanceId
          }
        }
      );

      // Обновляем метрику при освобождении задачи
      activeTasksTotal.set({ instance_id: instanceConfig.instanceNumber.toString() }, this.cronJobs.size);
    } catch (error) {
      logger.error(`Failed to release lock for task ${taskId}:`, error);
    }
  }

  private async releaseAllLocks() {
    try {
      // Освобождаем все advisory locks этого инстанса
      await sequelize.query('SELECT pg_advisory_unlock_all()');

      await Task.update(
        {
          is_running: false,
          running_instance: null
        },
        {
          where: { running_instance: this.instanceId }
        }
      );
    } catch (error) {
      logger.error('Failed to release all locks:', error);
    }
  }

  private async checkAndReclaimLocks() {
    const tasks = await Task.findAll({
      where: { running_instance: this.instanceId }
    });

    for (const task of tasks) {
      // Проверяем, что блокировка все еще наша
      const [result] = await sequelize.query(
        'SELECT pg_try_advisory_lock($1) as locked',
        {
          bind: [task.id],
          type: QueryTypes.SELECT
        }
      );

      const locked = (result as any).locked;

      if (!locked) {
        // Если блокировка потеряна, останавливаем задачу
        const cronJob = this.cronJobs.get(task.id);
        if (cronJob) {
          cronJob.stop();
          this.cronJobs.delete(task.id);
          // Обновляем метрику при потере блокировки
          activeTasksTotal.set({ instance_id: instanceConfig.instanceNumber.toString() }, this.cronJobs.size);
        }

        await Task.update(
          {
            is_running: false,
            running_instance: null
          },
          {
            where: {
              id: task.id,
              running_instance: this.instanceId
            }
          }
        );
      }
    }
  }

  private async scheduleTask(task: Task) {
    try {
      // Создаем запись в истории
      await TaskHistory.create({
        task_id: task.id,
        instance_id: this.instanceId,
        status: 'running',
        started_at: new Date()
      });

      // Планируем выполнение задачи
      const cronJob = cron.schedule(task.interval, async () => {
        try {
          await this.executeTask(task);
        } catch (error) {
          logger.error(`Failed to execute task ${task.id}:`, error);
          await this.handleTaskError(task, error);
        }
      });

      this.cronJobs.set(task.id, cronJob);
    } catch (error) {
      logger.error(`Failed to schedule task ${task.id}:`, error);
      await this.handleTaskError(task, error);
    }
  }

  private async executeTask(task: Task) {
    const transaction = await sequelize.transaction();
    try {
      // Проверяем, что блокировка все еще наша
      const [result] = await sequelize.query(
        'SELECT pg_try_advisory_lock($1) as locked',
        {
          bind: [task.id],
          type: QueryTypes.SELECT,
          transaction
        }
      );

      const locked = (result as any).locked;
      if (!locked) {
        throw new Error('Lost lock for task');
      }

      // Обновляем время последнего запуска
      await task.update({
        last_run_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      // Здесь должна быть логика выполнения задачи
      logger.info(`Executing task ${task.id}: ${task.name}`);

      await transaction.commit();

      // Освобождаем блокировку после выполнения задачи
      await sequelize.query('SELECT pg_advisory_unlock($1)', {
        bind: [task.id]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async handleTaskError(task: Task, error: any) {
    try {
      await this.releaseLock(task.id);

      // Создаем запись об ошибке в истории
      await TaskHistory.create({
        task_id: task.id,
        instance_id: this.instanceId,
        status: 'failed',
        started_at: new Date(),
        finished_at: new Date(),
        error: error.message
      });

      // Останавливаем cron job
      const cronJob = this.cronJobs.get(task.id);
      if (cronJob) {
        cronJob.stop();
        this.cronJobs.delete(task.id);
      }
    } catch (err) {
      logger.error(`Failed to handle task error ${task.id}:`, err);
    }
  }

  async getTasks() {
    return Task.findAll({
      include: [{
        model: TaskHistory,
        as: 'history',
        order: [['created_at', 'DESC']],
        limit: 1
      }]
    });
  }
}

export const taskService = new TaskService();
