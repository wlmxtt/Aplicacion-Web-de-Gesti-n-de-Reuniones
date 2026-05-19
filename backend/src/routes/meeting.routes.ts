import { Router } from 'express';
import { createMeeting, getMyMeetings, getAllMeetings, getMeetingById, updateMeetingStatus, confirmAttendance } from '../controllers/meeting.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// User-specific meetings
router.get('/my', getMyMeetings);

// All meetings (ADMIN only)
router.get('/all', roleMiddleware(['ADMIN']), getAllMeetings);

// Get single meeting by ID
router.get('/:id', getMeetingById);

// Create a meeting (Directors and Coordinators)
router.post('/', roleMiddleware(['ADMIN', 'DIRECTOR_UGMA', 'DIRECTOR_ESCUELA', 'COORDINADOR']), createMeeting);

// Update meeting status (Directors and Coordinators)
router.patch('/:id/status', roleMiddleware(['ADMIN', 'DIRECTOR_UGMA', 'DIRECTOR_ESCUELA', 'COORDINADOR']), updateMeetingStatus);

// Confirm attendance (any authenticated user who is a guest)
router.post('/:meetingId/confirm', confirmAttendance);

export default router;
