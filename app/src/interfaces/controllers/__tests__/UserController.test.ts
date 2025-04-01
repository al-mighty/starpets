import { UserController } from '../UserController';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { Request, Response } from 'express';
import { User } from '../../../domain/user/User';
import { UpdateBalanceUseCase } from '../../../application/user/UpdateBalanceUseCase';

// Мокаем UserRepository для изоляции тестов от реальной базы данных
jest.mock('../../../infrastructure/repositories/UserRepository');

describe('UserController - Performance Tests', () => {
  let controller: UserController;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Создаем мок репозитория для каждого теста
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    
    // Создаем контроллер с моком репозитория
    controller = new UserController();
    (controller as any).userRepository = mockUserRepository;
    (controller as any).updateBalanceUseCase = new UpdateBalanceUseCase(mockUserRepository);

    // Настраиваем мок ответа с методами status и json
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Настраиваем мок запроса с тестовыми данными
    mockRequest = {
      body: {
        userId: 1,
        amount: 100,
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Тест производительности системы под нагрузкой
   * Проверяет:
   * 1. Время обработки 10000 параллельных запросов
   * 2. Корректность обработки всех запросов
   * 3. Среднее время на запрос (должно быть < 100мс)
   */
  test('should handle 10000 concurrent requests efficiently', async () => {
    const startTime = Date.now();
    const numberOfRequests = 10000;
    const batchSize = 100; // Размер пакета для параллельной обработки

    // Создаем тестового пользователя
    const user = new User(1, 0);
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.updateBalance.mockImplementation(async (id: number, amount: number) => {
      const currentUser = await mockUserRepository.findById(id);
      if (currentUser) {
        currentUser.updateBalance(amount);
      }
    });

    // Создаем массив промисов для параллельных запросов
    const requests = Array(numberOfRequests).fill(null).map((_, index) => {
      return controller.updateBalance(
        mockRequest as Request,
        mockResponse as Response
      );
    });

    // Обрабатываем запросы пакетами для контроля нагрузки
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Проверяем, что все запросы были обработаны успешно
    expect(mockResponse.status).toHaveBeenCalledTimes(numberOfRequests);
    expect(mockResponse.json).toHaveBeenCalledTimes(numberOfRequests);

    // Проверяем производительность
    const averageTimePerRequest = totalTime / numberOfRequests;
    console.log(`Average time per request: ${averageTimePerRequest}ms`);
    console.log(`Total time: ${totalTime}ms`);

    // Устанавливаем порог в 100мс на запрос
    expect(averageTimePerRequest).toBeLessThan(100);
  });

  /**
   * Тест консистентности данных под высокой нагрузкой
   * Проверяет:
   * 1. Корректность обновления баланса при параллельных запросах
   * 2. Отсутствие потери данных при высокой нагрузке
   * 3. Точность финального баланса
   */
  test('should maintain data consistency under high load', async () => {
    const numberOfRequests = 10000;
    const initialBalance = 1000000;
    const updateAmount = 100;

    // Создаем тестового пользователя с большим начальным балансом
    const user = new User(1, initialBalance);
    const userRef = { balance: initialBalance };
    
    mockUserRepository.findById.mockImplementation(async () => {
      return new User(1, userRef.balance);
    });
    
    mockUserRepository.updateBalance.mockImplementation(async (id: number, amount: number) => {
      userRef.balance += amount;
    });

    // Создаем массив промисов для параллельных запросов
    const requests = Array(numberOfRequests).fill(null).map((_, index) => {
      return controller.updateBalance(
        mockRequest as Request,
        mockResponse as Response
      );
    });

    // Запускаем все запросы параллельно
    await Promise.all(requests);

    // Проверяем финальный баланс (должен быть равен начальному + сумма всех обновлений)
    const finalUser = await mockUserRepository.findById(1);
    expect(finalUser?.getBalance()).toBe(initialBalance + (updateAmount * numberOfRequests));
  });
}); 