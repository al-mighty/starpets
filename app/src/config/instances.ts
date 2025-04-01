import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Количество инстансов приложения
const INSTANCE_COUNT = parseInt(process.env.TOTAL_INSTANCES || '1', 10);

// Базовый порт для первого инстанса
const BASE_PORT = parseInt(process.env.PORT || '3000', 10);

// Получаем номер текущего инстанса из переменной окружения
const INSTANCE_NUMBER = parseInt(process.env.INSTANCE_NUMBER || '1', 10);

// Проверяем корректность номера инстанса
if (INSTANCE_NUMBER < 1 || INSTANCE_NUMBER > INSTANCE_COUNT) {
  throw new Error(`Invalid instance number: ${INSTANCE_NUMBER}. Must be between 1 and ${INSTANCE_COUNT}`);
}

// Вычисляем порт для текущего инстанса
const PORT = BASE_PORT + (INSTANCE_NUMBER - 1);

export interface InstanceConfig {
  instanceNumber: number;
  totalInstances: number;
  heartbeatInterval: number;
  recoveryInterval: number;
  maxFailures: number;
  metricsUpdateInterval: number;
  instanceTimeout: number;
  port: number;
  basePort: number;
  isFirstInstance: boolean;
  isLastInstance: boolean;
  isMaster: boolean;
  masterPort: number;
  workerPorts: number[];
  hostnames: string[];
}

// Конфигурация для текущего инстанса
export const instanceConfig = {
  instanceNumber: INSTANCE_NUMBER,
  port: PORT,
  basePort: BASE_PORT,
  totalInstances: INSTANCE_COUNT,
  isFirstInstance: INSTANCE_NUMBER === 1,
  isLastInstance: INSTANCE_NUMBER === INSTANCE_COUNT,
  isMaster: process.env.IS_MASTER === 'true',
  masterPort: 3003,
  workerPorts: Array.from({ length: INSTANCE_COUNT - 1 }, (_, i) => 3004 + i),
  heartbeatInterval: Number(process.env.HEARTBEAT_INTERVAL) || 5000,
  recoveryInterval: Number(process.env.RECOVERY_INTERVAL) || 10000,
  maxFailures: Number(process.env.MAX_FAILURES) || 3,
  metricsUpdateInterval: Number(process.env.METRICS_UPDATE_INTERVAL) || 5000,
  instanceTimeout: Number(process.env.INSTANCE_TIMEOUT) || 30000,
  hostnames: Array.from({ length: INSTANCE_COUNT }, (_, i) => `worker${i + 1}`)
};

// Конфигурация для всех инстансов
export const instancesConfig = {
  count: INSTANCE_COUNT,
  basePort: BASE_PORT,
  ports: Array.from({ length: INSTANCE_COUNT }, (_, i) => BASE_PORT + i),
};
