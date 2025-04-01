import { Task } from '../models/task';
import { taskService } from '../services/TaskService';
import { logger } from '../utils/logger';

// Функция для эмуляции длительной работы
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Инициализация тестовых задач
export async function initTestTasks(): Promise<void> {
  try {
    await taskService.start();
    logger.info('Test tasks initialized');
  } catch (error) {
    logger.error('Failed to initialize test tasks:', error);
    throw error;
  }
}
