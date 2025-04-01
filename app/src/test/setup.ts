import dotenv from 'dotenv';

// Загружаем переменные окружения для тестов
dotenv.config({ path: '.env.test' });

// Увеличиваем таймаут для тестов
jest.setTimeout(10000); 