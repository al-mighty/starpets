import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { sequelize } from '../../config/database';

interface UserRecord {
  id: number;
  balance: number;
}

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const [results] = await sequelize.query(
      'SELECT * FROM users WHERE id = :id',
      {
        replacements: { id },
        type: 'SELECT',
      }
    ) as [UserRecord[], unknown];

    if (!results || results.length === 0) return null;

    const user = results[0];
    return new User(user.id, user.balance);
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

  async updateBalance(id: number, amount: number): Promise<void> {
    await sequelize.query(
      'UPDATE users SET balance = balance + :amount WHERE id = :id',
      {
        replacements: {
          id,
          amount,
        },
      }
    );
  }
}