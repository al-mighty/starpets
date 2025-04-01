import { Router } from 'express';
import { taskController } from '../controllers/TaskController';

const router = Router();

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.delete('/:id', taskController.deleteTask);

export default router;
