'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskHistory extends Model {
    static associate(models) {
      TaskHistory.belongsTo(models.Task, {
        foreignKey: 'task_id',
        as: 'task'
      });
    }
  }

  TaskHistory.init({
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      }
    },
    instance_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('running', 'completed', 'failed'),
      defaultValue: 'running'
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TaskHistory',
    tableName: 'task_history',
    underscored: true
  });

  return TaskHistory;
};
