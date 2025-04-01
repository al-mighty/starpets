import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './database';
import path from 'path';

const MIGRATIONS_PATH = path.join(process.cwd(), 'src', 'migrations');

export const umzug = new Umzug({
  migrations: {
    glob: ['[0-9]*.ts', { cwd: MIGRATIONS_PATH }],
    resolve: ({ name, path: migrationPath, context }) => {
      const absolutePath = path.join(MIGRATIONS_PATH, name);
      return {
        name,
        up: async () => import(absolutePath).then(m => m.up(context)),
        down: async () => import(absolutePath).then(m => m.down(context)),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});