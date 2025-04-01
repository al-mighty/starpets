import { Request, Response } from 'express';
import { UpdateBalanceUseCase } from '../../application/user/UpdateBalanceUseCase';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import logger from '../../config/logger';

export class UserController {
  private updateBalanceUseCase: UpdateBalanceUseCase;
  private userRepository: UserRepository;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository || new UserRepository();
    this.updateBalanceUseCase = new UpdateBalanceUseCase(this.userRepository);
  }

  async updateBalance(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount } = req.body;

      if (!userId || amount === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      await this.updateBalanceUseCase.execute(Number(userId), Number(amount));
      res.status(200).json({ message: 'Balance updated successfully' });
    } catch (error) {
      logger.error('Error updating balance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 