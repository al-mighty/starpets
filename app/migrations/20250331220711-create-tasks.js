'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error: {
        type: Sequelize.JSONB,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  }
};
