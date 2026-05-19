import { Router } from 'express';
import { getSchools } from '../controllers/school.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getSchools);

export default router;
