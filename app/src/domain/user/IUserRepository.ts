import { User } from './User';
import { Transaction } from 'sequelize';

export interface IUserRepository {
  findById(id: number, transaction?: Transaction): Promise<User | null>;
  findByIdForUpdate(id: number, transaction: Transaction): Promise<User | null>;
  save(user: User): Promise<void>;
  updateBalance(userId: number, amount: number): Promise<User | null>;
}
