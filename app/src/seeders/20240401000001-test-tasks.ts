'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tasks = [
      {
        name: 'Ежеминутная задача',
        interval: '* * * * *',
        function_name: 'minuteTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Задача каждые 5 минут',
        interval: '*/5 * * * *',
        function_name: 'fiveMinuteTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Задача каждые 15 минут',
        interval: '*/15 * * * *',
        function_name: 'quarterHourTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Задача каждые 30 минут',
        interval: '*/30 * * * *',
        function_name: 'halfHourTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ежечасная задача',
        interval: '0 * * * *',
        function_name: 'hourlyTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Задача каждые 2 часа',
        interval: '0 */2 * * *',
        function_name: 'twoHourTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Задача каждые 4 часа',
        interval: '0 */4 * * *',
        function_name: 'fourHourTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ежедневная задача в полночь',
        interval: '0 0 * * *',
        function_name: 'dailyTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Еженедельная задача',
        interval: '0 0 * * 0',
        function_name: 'weeklyTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ежемесячная задача',
        interval: '0 0 1 * *',
        function_name: 'monthlyTask',
        is_running: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('tasks', tasks);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('tasks', {});
  }
};
