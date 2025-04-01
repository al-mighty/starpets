'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        }
      },
      instance_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      finished_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('running', 'completed', 'failed'),
        defaultValue: 'running'
      },
      error: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('task_history');
  }
};
