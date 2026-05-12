import { Router } from 'express';
import { createMeeting, getMyMeetings, updateMeetingStatus, confirmAttendance } from '../controllers/meeting.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/my', getMyMeetings);
router.post('/', roleMiddleware(['DIRECTOR_UGMA', 'DIRECTOR_ESCUELA', 'COORDINADOR']), createMeeting);
router.patch('/:id/status', roleMiddleware(['DIRECTOR_UGMA', 'DIRECTOR_ESCUELA', 'COORDINADOR']), updateMeetingStatus);
router.post('/:meetingId/confirm', confirmAttendance);

export default router;
