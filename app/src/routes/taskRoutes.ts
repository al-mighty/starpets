import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks with their current status
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
router.get('/', taskController.getTasks);

export default router;
