import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('task_history', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      instance_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      finished_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('task_history');
  },
};
