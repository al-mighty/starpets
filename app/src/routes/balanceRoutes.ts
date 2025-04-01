import { Router } from 'express';
import { updateBalance, getBalance } from '../controllers/balanceController';

const router = Router();

router.post('/update', updateBalance);
router.get('/:userId', getBalance);

export default router;
