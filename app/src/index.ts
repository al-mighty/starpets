import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { instanceConfig } from './config/instances';
import logger from './config/logger';
import taskRoutes from './routes/taskRoutes';
import healthRoutes from './routes/healthRoutes';
import { register, httpRequestsTotal, httpRequestDurationSeconds } from './config/metrics';
import { taskService } from './services/TaskService';
import { sequelize } from './config/database';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Middleware для сбора метрик
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    httpRequestsTotal.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      instance_id: instanceConfig.instanceNumber.toString()
    });

    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        instance_id: instanceConfig.instanceNumber.toString()
      },
      duration / 1000
    );
  });

  next();
});

// Эндпоинт для Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/health', healthRoutes);

// Initialize database and tasks
const init = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    await taskService.start();
    logger.info('Tasks initialized');

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Instance ${instanceConfig.instanceNumber} started`);
    });
  } catch (err) {
    logger.error('Unable to initialize application:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await taskService.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  await taskService.stop();
  process.exit(0);
});

init();
