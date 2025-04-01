import { Router } from 'express';
import { instanceConfig } from '../../config/instances';

const router = Router();

// Проверка здоровья инстанса
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    instanceId: instanceConfig.instanceNumber,
    timestamp: new Date().toISOString(),
    metrics: {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
});

// Метрики инстанса
router.get('/metrics', (req, res) => {
  res.json({
    instanceId: instanceConfig.instanceNumber,
    status: 'active',
    lastHeartbeat: new Date().toISOString(),
    metrics: {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      activeTasksCount: 0 // TODO: Добавить подсчет активных задач
    }
  });
});

export default router;