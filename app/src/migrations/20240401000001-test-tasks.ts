import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    try {
      // Удаляем все существующие задачи
      await queryInterface.bulkDelete('tasks', {}, {});

      // Добавляем уникальный индекс на interval
      await queryInterface.addIndex('tasks', ['interval'], {
        unique: true,
        name: 'tasks_interval_unique'
      });

      // Создаем массив уникальных задач
      const tasks = [
        {
          name: 'Задача каждые 30 секунд',
          interval: '*/30 * * * * *',
          function_name: 'thirtySecondTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Ежеминутная задача',
          interval: '* * * * *',
          function_name: 'minuteTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 2 минуты',
          interval: '*/2 * * * *',
          function_name: 'twoMinuteTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 5 минут',
          interval: '*/5 * * * *',
          function_name: 'fiveMinuteTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 10 минут',
          interval: '*/10 * * * *',
          function_name: 'tenMinuteTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 15 минут',
          interval: '*/15 * * * *',
          function_name: 'quarterHourTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 30 минут',
          interval: '*/30 * * * *',
          function_name: 'halfHourTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Ежечасная задача',
          interval: '0 * * * *',
          function_name: 'hourlyTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 2 часа',
          interval: '0 */2 * * *',
          function_name: 'twoHourTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Задача каждые 4 часа',
          interval: '0 */4 * * *',
          function_name: 'fourHourTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Ежедневная задача в полночь',
          interval: '0 0 * * *',
          function_name: 'dailyTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Еженедельная задача',
          interval: '0 0 * * 0',
          function_name: 'weeklyTask',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Ежемесячная задача',
          interval: '0 0 1 * *',
          function_name: 'monthlyTask',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Вставляем новые задачи
      await queryInterface.bulkInsert('tasks', tasks);
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeIndex('tasks', 'tasks_interval_unique');
      await queryInterface.bulkDelete('tasks', {}, {});
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
