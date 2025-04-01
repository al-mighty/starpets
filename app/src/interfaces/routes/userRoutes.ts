import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users/balance:
 *   post:
 *     summary: Обновить баланс пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: number
 *                 description: ID пользователя
 *               amount:
 *                 type: number
 *                 description: Сумма для изменения баланса (положительная или отрицательная)
 *     responses:
 *       200:
 *         description: Баланс успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Balance updated successfully
 *       400:
 *         description: Отсутствуют обязательные поля
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/balance', userController.updateBalance.bind(userController));

export default router; 