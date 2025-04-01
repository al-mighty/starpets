'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.hasMany(models.TaskHistory, {
        foreignKey: 'task_id',
        as: 'history'
      });
    }
  }

  Task.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: false
    },
    function_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_running: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    running_instance: {
      type: DataTypes.STRING,
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_run_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    underscored: true
  });

  return Task;
};
