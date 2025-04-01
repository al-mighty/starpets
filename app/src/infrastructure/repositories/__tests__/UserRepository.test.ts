import { UserRepository } from '../UserRepository';
import { sequelize } from '../../../config/database';
import { User } from '../../../domain/user/User';

// Мокаем Sequelize
jest.mock('../../../config/database', () => ({
  sequelize: {
    query: jest.fn(),
    close: jest.fn(),
    transaction: jest.fn().mockImplementation(callback => callback()),
  },
}));

describe('UserRepository - Parallel Operations', () => {
  let repository: UserRepository;
  let mockUsers: Map<number, User>;

  beforeAll(async () => {
    repository = new UserRepository();
    mockUsers = new Map();
  });

  beforeEach(async () => {
    mockUsers.clear();
    // Мокаем методы Sequelize
    (sequelize.query as jest.Mock).mockImplementation(async (sql: string, options: any) => {
      if (sql.includes('TRUNCATE')) {
        mockUsers.clear();
        return;
      }
      
      if (sql.includes('SELECT')) {
        const userId = options.replacements.id;
        const user = mockUsers.get(userId);
        return [[user ? { id: user.getId(), balance: user.getBalance() } : null]];
      }
      
      if (sql.includes('UPDATE')) {
        const { id, amount } = options.replacements;
        const user = mockUsers.get(id);
        if (user) {
          user.updateBalance(amount);
          return [[{ id: user.getId(), balance: user.getBalance() }]];
        }
      }
      
      if (sql.includes('INSERT')) {
        const { id, balance } = options.replacements;
        const user = new User(id, balance);
        mockUsers.set(id, user);
        return [[{ id, balance }]];
      }
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should handle concurrent balance updates correctly', async () => {
    // Создаем тестового пользователя
    const user = new User(1, 1000);
    await repository.save(user);

    // Создаем массив промисов для параллельных обновлений
    const updates = Array(10).fill(null).map((_, index) => {
      return repository.updateBalance(1, 100);
    });

    // Запускаем все обновления параллельно
    await Promise.all(updates);

    // Проверяем финальный баланс
    const updatedUser = await repository.findById(1);
    expect(updatedUser?.getBalance()).toBe(2000); // 1000 + (100 * 10)
  });

  test('should maintain data consistency under concurrent updates', async () => {
    // Создаем тестового пользователя
    const user = new User(1, 10000);
    await repository.save(user);

    const numberOfUpdates = 100;
    const updateAmount = 100;

    // Создаем массив промисов для параллельных обновлений
    const updates = Array(numberOfUpdates).fill(null).map((_, index) => {
      return repository.updateBalance(1, updateAmount);
    });

    // Запускаем все обновления параллельно
    await Promise.all(updates);

    // Проверяем финальный баланс
    const updatedUser = await repository.findById(1);
    expect(updatedUser?.getBalance()).toBe(10000 + (updateAmount * numberOfUpdates));
  });

  test('should handle concurrent negative balance updates', async () => {
    // Создаем тестового пользователя
    const user = new User(1, 1000);
    await repository.save(user);

    // Создаем массив промисов для параллельных обновлений с отрицательными значениями
    const updates = Array(5).fill(null).map((_, index) => {
      return repository.updateBalance(1, -200);
    });

    // Запускаем все обновления параллельно
    await Promise.all(updates);

    // Проверяем, что баланс уменьшился корректно
    const updatedUser = await repository.findById(1);
    expect(updatedUser?.getBalance()).toBe(0); // 1000 - (200 * 5)
  });

  test('should handle concurrent reads and writes', async () => {
    // Создаем тестового пользователя
    const user = new User(1, 1000);
    await repository.save(user);

    // Создаем массив промисов для параллельных операций чтения и записи
    const operations = Array(20).fill(null).map((_, index) => {
      if (index % 2 === 0) {
        // Операция чтения
        return repository.findById(1);
      } else {
        // Операция записи
        return repository.updateBalance(1, 100);
      }
    });

    // Запускаем все операции параллельно
    const results = await Promise.all(operations);

    // Проверяем финальный баланс
    const updatedUser = await repository.findById(1);
    expect(updatedUser?.getBalance()).toBe(2000); // 1000 + (100 * 10)
  });
}); 