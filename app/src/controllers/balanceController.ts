import { Request, Response } from 'express';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { sequelize } from '../config/database';

const userRepository = new UserRepository();

export const updateBalance = async (req: Request, res: Response): Promise<void> => {
  const { userId, amount } = req.body;

  if (!userId || typeof amount !== 'number') {
    res.status(400).json({ error: 'Invalid input parameters' });
    return;
  }

  const t = await sequelize.transaction();

  try {
    const user = await userRepository.findById(userId, t);

    if (!user) {
      await t.rollback();
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Обновляем баланс через объект User
    user.updateBalance(amount);

    // Сохраняем обновленный баланс
    await sequelize.query(
      'UPDATE users SET balance = :newBalance WHERE id = :id',
      {
        replacements: {
          id: userId,
          newBalance: user.getBalance(),
        },
        transaction: t,
      }
    );

    await t.commit();
    res.json({ balance: user.getBalance() });
  } catch (error) {
    await t.rollback();
    if (error instanceof Error && error.message === 'Insufficient funds') {
      res.status(400).json({ error: 'Insufficient funds' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const user = await userRepository.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ balance: user.getBalance() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
