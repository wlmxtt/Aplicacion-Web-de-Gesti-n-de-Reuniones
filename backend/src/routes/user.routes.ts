import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// All authenticated users can list users (needed for inviting guests)
router.get('/', getUsers);
router.get('/:id', getUserById);

// Only ADMIN can modify/delete users
router.patch('/:id', roleMiddleware(['ADMIN']), updateUser);
router.delete('/:id', roleMiddleware(['ADMIN']), deleteUser);

export default router;
