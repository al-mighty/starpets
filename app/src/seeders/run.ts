import { sequelize } from '../config/database';
import logger from '../config/logger';

async function runSeeders() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Проверяем существование таблицы
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) {
      console.log('Table users does not exist. Skipping seeders.');
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    logger.info('Seeders completed successfully');
  } catch (error) {
    logger.error('Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders(); 