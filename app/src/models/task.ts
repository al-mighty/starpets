import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Task extends Model {
  public id!: number;
  public name!: string;
  public interval!: string;
  public function_name!: string;
  public is_running!: boolean;
  public running_instance!: string | null;
  public started_at!: Date | null;
  public last_run_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
}

export class TaskHistory extends Model {
  public id!: number;
  public task_id!: number;
  public instance_id!: string;
  public status!: 'running' | 'completed' | 'failed';
  public started_at!: Date;
  public finished_at!: Date | null;
  public error!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    function_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_running: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    running_instance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_run_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    modelName: 'Task',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

TaskHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: 'id'
      }
    },
    instance_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('running', 'completed', 'failed'),
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
    error: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'task_history',
    modelName: 'TaskHistory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Task.hasMany(TaskHistory, {
  foreignKey: 'task_id',
  as: 'history'
});

TaskHistory.belongsTo(Task, {
  foreignKey: 'task_id',
  as: 'task'
});
