import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { instanceConfig } from './config/instances';
import logger from './config/logger';
import taskRoutes from './routes/taskRoutes';
import healthRoutes from './routes/healthRoutes';
import balanceRoutes from './routes/balanceRoutes';
import { register, httpRequestsTotal, httpRequestDurationSeconds } from './config/metrics';
import { taskService } from './services/TaskService';
import { sequelize } from './config/database';
import { umzug } from './config/umzug';
import { User } from './models/User';
import { setupMetrics } from './metrics';
import { setupTasks } from './tasks';
import { Umzug } from 'umzug';

const app = express();
const port = process.env.PORT || 3000;
const instanceId = process.env.INSTANCE_ID || '1';

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
app.use('/health', healthRoutes);
app.use('/tasks', taskRoutes);
app.use('/balance', balanceRoutes);

// Health check
app.get('/health', (_, res) => res.send('OK'));

// Initialize
async function start() {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established', { instanceId });

    // Run migrations
    const umzug = new Umzug({
      migrations: { glob: 'src/migrations/*.js' },
      context: sequelize,
      storage: { sequelize },
      logger: console,
    });
    await umzug.up();
    logger.info('Migrations completed', { instanceId });

    // Initialize models
    User.initModel(sequelize);

    // Setup metrics
    setupMetrics(app);

    // Setup tasks
    await setupTasks(instanceId);

    // Start server
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`, { instanceId });
      logger.info(`Instance ${instanceId} started`, { instanceId });
    });
  } catch (error) {
    logger.error('Failed to start server', { error, instanceId });
    process.exit(1);
  }
}

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

start();
