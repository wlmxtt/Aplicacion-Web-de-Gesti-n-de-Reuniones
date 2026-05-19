import { Router } from 'express';
import { getNotifications, markAllAsRead } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.post('/read-all', markAllAsRead);

export default router;
