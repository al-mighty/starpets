import { Request, Response } from 'express';
import { taskService } from '../../services/TaskService';
import { Task } from '../../models/task';
import { logger } from '../../utils/logger';

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await taskService.getTasks();
      res.json(tasks);
    } catch (error) {
      logger.error('Failed to get tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      logger.error('Failed to get task:', error);
      res.status(500).json({ error: 'Failed to get task' });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      await task.destroy();
      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

export const taskController = new TaskController();
