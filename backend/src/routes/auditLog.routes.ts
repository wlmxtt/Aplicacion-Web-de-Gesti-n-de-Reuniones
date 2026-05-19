import { Router } from 'express';
import { getAuditLogs, addAuditLog } from '../controllers/auditLog.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Only ADMIN can view audit logs
router.get('/', roleMiddleware(['ADMIN']), getAuditLogs);
router.post('/', addAuditLog);

export default router;
