import { Router } from 'express';
import { taskController } from '../controllers/TaskController';

const router = Router();

router.get('/', taskController.getTasks);

export default router;
