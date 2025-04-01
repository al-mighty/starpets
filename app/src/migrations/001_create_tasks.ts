import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Создаем таблицу tasks
  await queryInterface.createTable('tasks', {
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
    }
  });

  // Создаем таблицу task_history
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
    }
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('task_history');
  await queryInterface.dropTable('tasks');
}
