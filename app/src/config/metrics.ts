import { collectDefaultMetrics, Registry, Counter, Histogram, Gauge } from 'prom-client';
import { instanceConfig } from './instances';

// Создаем новый реестр метрик
export const register = new Registry();

// Включаем сбор стандартных метрик Node.js
collectDefaultMetrics({ register });

// Метрика для подсчета HTTP запросов
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status', 'instance_id'],
  registers: [register]
});

// Метрика для измерения времени ответа
export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status', 'instance_id'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Метрика для активных задач
export const activeTasksTotal = new Gauge({
  name: 'app_active_tasks_total',
  help: 'Total number of active tasks',
  labelNames: ['instance_id'],
  registers: [register]
});
