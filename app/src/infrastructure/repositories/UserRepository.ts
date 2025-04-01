import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { sequelize } from '../../config/database';
import { Transaction } from 'sequelize';

interface UserRecord {
  id: number;
  balance: number;
}

export class UserRepository implements IUserRepository {
  async findById(id: number, transaction?: Transaction): Promise<User | null> {
    const [results] = await sequelize.query(
      'SELECT * FROM users WHERE id = :id',
      {
        replacements: { id },
        type: 'SELECT',
        transaction,
      }
    ) as [UserRecord[], unknown];

    if (!results || results.length === 0) return null;

    const user = results[0];
    return new User(user.id, Number(user.balance));
  }

  async findByIdForUpdate(id: number, transaction: Transaction): Promise<User | null> {
    const [results] = await sequelize.query(
      'SELECT * FROM users WHERE id = :id FOR UPDATE',
      {
        replacements: { id },
        type: 'SELECT',
        transaction,
      }
    ) as [UserRecord[], unknown];

    if (!results || results.length === 0) return null;

    const user = results[0];
    return new User(user.id, Number(user.balance));
  }

  async save(user: User): Promise<void> {
    await sequelize.query(
      'INSERT INTO users (id, balance) VALUES (:id, :balance) ON CONFLICT (id) DO UPDATE SET balance = :balance',
      {
        replacements: {
          id: user.getId(),
          balance: user.getBalance(),
        },
      }
    );
  }

  async updateBalance(id: number, amount: number): Promise<User | null> {
    const t = await sequelize.transaction();
    try {
      // Получаем текущий баланс с блокировкой строки
      const user = await this.findByIdForUpdate(id, t);

      if (!user) {
        throw new Error('User not found');
      }

      // Обновляем баланс через объект User
      user.updateBalance(amount);

      // Сохраняем обновленный баланс
      await sequelize.query(
        'UPDATE users SET balance = :newBalance WHERE id = :id',
        {
          replacements: {
            id,
            newBalance: user.getBalance(),
          },
          transaction: t,
        }
      );

      await t.commit();
      return user;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
