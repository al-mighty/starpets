import express from 'express';
import taskRoutes from './routes/taskRoutes';
import { initTestTasks } from './cron/tasks';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Инициализация тестовых задач при старте
initTestTasks().catch(error => {
  logger.error('Failed to initialize test tasks:', error);
});

logger.info('Application initialized');

export default app;
