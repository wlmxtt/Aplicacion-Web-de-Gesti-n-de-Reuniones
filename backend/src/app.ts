import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import meetingRoutes from './routes/meeting.routes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UGMA Meetings API is running' });
});

// TODO: Import and use other routes
// app.use('/api/meetings', meetingRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/schools', schoolRoutes);

export default app;
