import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';

export class UpdateBalanceUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number, amount: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateBalance(amount);
    await this.userRepository.updateBalance(userId, amount);
  }
} 