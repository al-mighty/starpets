'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tasks = [
      {
        name: 'Data Processing Task 1',
        interval: '*/5 * * * *',
        function_name: 'processData1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Data Processing Task 2',
        interval: '*/7 * * * *',
        function_name: 'processData2',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cleanup Task',
        interval: '*/10 * * * *',
        function_name: 'cleanup',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Report Generation',
        interval: '*/15 * * * *',
        function_name: 'generateReport',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Data Sync Task',
        interval: '*/8 * * * *',
        function_name: 'syncData',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Metrics Collection',
        interval: '*/6 * * * *',
        function_name: 'collectMetrics',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cache Invalidation',
        interval: '*/12 * * * *',
        function_name: 'invalidateCache',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Backup Task',
        interval: '*/20 * * * *',
        function_name: 'backup',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Health Check',
        interval: '*/3 * * * *',
        function_name: 'healthCheck',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Log Rotation',
        interval: '*/25 * * * *',
        function_name: 'rotateLogs',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('tasks', tasks);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tasks', null, {});
  }
};
