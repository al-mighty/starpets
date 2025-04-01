import { User } from './User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<void>;
  updateBalance(userId: number, amount: number): Promise<void>;
} 