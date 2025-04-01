'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      interval: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Cron expression'
      },
      function_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_running: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      running_instance: {
        type: Sequelize.STRING,
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_run_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tasks');
  }
};
