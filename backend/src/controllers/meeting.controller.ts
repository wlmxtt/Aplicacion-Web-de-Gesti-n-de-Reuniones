import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const meetingSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string().transform((str: string) => new Date(str)),
  time: z.string(),
  location: z.string(),
  guestIds: z.array(z.string().uuid()),
});

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = meetingSchema.parse(req.body);
    const creatorId = req.user!.userId;

    const meeting = await prisma.meeting.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        time: validatedData.time,
        location: validatedData.location,
        creatorId: creatorId,
        guests: {
          create: validatedData.guestIds.map((userId: string) => ({
            userId: userId,
          })),
        },
      },
      include: {
        guests: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // TODO: Send emails to guests
    // notificationService.sendInvitations(meeting);

    return res.status(201).json(meeting);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};

export const getMyMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { guests: { some: { userId: userId } } },
        ],
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        guests: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return res.json(meetings);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMeetingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, conclusions } = req.body;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        status,
        conclusions,
      },
    });

    return res.json(meeting);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const confirmAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { status, proposedAgenda } = req.body;
    const userId = req.user!.userId;

    const guest = await prisma.meetingGuest.update({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
      data: {
        attendanceStatus: status,
        proposedAgenda,
      },
    });

    return res.json(guest);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
