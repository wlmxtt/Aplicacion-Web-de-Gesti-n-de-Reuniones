import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createNotification } from './notification.controller';
import { createAuditLogEntry } from './auditLog.controller';
import { sendMeetingInvitation, sendMeetingUpdate } from '../services/email.service';

const meetingSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string().transform((str: string) => new Date(str)),
  time: z.string(),
  location: z.string(),
  guestIds: z.array(z.string().uuid()),
});

const meetingInclude = {
  creator: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      schoolId: true,
      school: true,
    },
  },
  guests: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          schoolId: true,
          school: true,
        },
      },
    },
  },
};

// POST /api/meetings
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
      include: meetingInclude,
    });

    // Get the creator info for notifications
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Un usuario';

    // Create notification for each guest
    for (const guest of meeting.guests) {
      await createNotification({
        title: 'Nueva Reunión Convocada',
        message: `${creatorName} ha convocado a la reunión "${meeting.title}" para el ${meeting.date.toLocaleDateString('es-VE')}.`,
        type: 'info',
        userId: guest.userId,
      });

      // Silent email (logs to console if SMTP not configured)
      if (guest.user?.email) {
        sendMeetingInvitation(guest.user.email, meeting).catch(() => {});
      }
    }

    // Audit log
    if (creator) {
      await createAuditLogEntry(`CONVOCATORIA DE REUNIÓN: ${meeting.title}`, creator.email, req.ip || undefined);
    }

    return res.status(201).json(meeting);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};

// GET /api/meetings/my
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
      include: meetingInclude,
      orderBy: {
        date: 'asc',
      },
    });

    return res.json(meetings);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/meetings (all - for ADMIN)
export const getAllMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: meetingInclude,
      orderBy: {
        date: 'desc',
      },
    });

    return res.json(meetings);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/meetings/:id
export const getMeetingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: meetingInclude,
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    return res.json(meeting);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/meetings/:id/status
export const updateMeetingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, conclusions } = req.body;

    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
      include: { guests: { include: { user: true } } },
    });

    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // If marking as EJECUTADA, update guest attendance
    const guestUpdates: any[] = [];
    if (status === 'EJECUTADA') {
      for (const guest of existingMeeting.guests) {
        const newStatus = guest.attendanceStatus === 'CONFIRMADA' ? 'ASISTIO'
          : guest.attendanceStatus === 'PENDIENTE' ? 'NO_ASISTIO'
          : guest.attendanceStatus;

        if (newStatus !== guest.attendanceStatus) {
          guestUpdates.push(
            prisma.meetingGuest.update({
              where: { id: guest.id },
              data: { attendanceStatus: newStatus },
            })
          );
        }
      }
    }

    // Execute updates in a transaction
    const [meeting] = await prisma.$transaction([
      prisma.meeting.update({
        where: { id },
        data: {
          status,
          ...(conclusions !== undefined && { conclusions }),
        },
        include: meetingInclude,
      }),
      ...guestUpdates,
    ]);

    // Get updater info
    const updater = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const updaterName = updater ? `${updater.firstName} ${updater.lastName}` : 'El organizador';

    // Notifications
    let notifTitle = 'Reunión Actualizada';
    let notifMsg = `La reunión "${existingMeeting.title}" ha sido actualizada a: ${status}.`;
    let notifType: 'info' | 'success' | 'warning' | 'alert' = 'info';

    if (status === 'CANCELADA') {
      notifTitle = 'Reunión Cancelada';
      notifMsg = `${updaterName} ha cancelado la reunión "${existingMeeting.title}".`;
      notifType = 'warning';
    } else if (status === 'EJECUTADA') {
      notifTitle = 'Minutas y Acuerdos Registrados';
      notifMsg = `${updaterName} ha cerrado la reunión "${existingMeeting.title}" y registrado los acuerdos finales.`;
      notifType = 'success';
    }

    // Create notification for each guest
    for (const guest of existingMeeting.guests) {
      await createNotification({
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        userId: guest.userId,
      });

      // Silent email
      if (guest.user?.email) {
        sendMeetingUpdate(guest.user.email, existingMeeting).catch(() => {});
      }
    }

    // Audit
    if (updater) {
      await createAuditLogEntry(
        `ACTUALIZACIÓN DE REUNIÓN (${status}): ${existingMeeting.title}`,
        updater.email,
        req.ip || undefined
      );
    }

    return res.json(meeting);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};

// POST /api/meetings/:meetingId/confirm
export const confirmAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { status, attendanceStatus, proposedAgenda } = req.body;
    const userId = req.user!.userId;

    // Support both 'status' and 'attendanceStatus' field names from frontend
    const finalStatus = attendanceStatus || status;

    const guest = await prisma.meetingGuest.update({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
      data: {
        attendanceStatus: finalStatus,
        ...(proposedAgenda !== undefined && { proposedAgenda }),
      },
    });

    // Create notification for the meeting creator
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (meeting && user) {
      const userName = `${user.firstName} ${user.lastName}`;
      const statusLabel = finalStatus === 'CONFIRMADA' ? 'confirmó su asistencia'
        : finalStatus === 'RECHAZADA' ? 'declinó su asistencia'
        : 'actualizó su estatus';

      let notifMsg = `${userName} ${statusLabel} para la reunión "${meeting.title}".`;
      if (proposedAgenda) {
        notifMsg += ` Además, propuso un tema en agenda: "${proposedAgenda.substring(0, 40)}..."`;
      }

      await createNotification({
        title: proposedAgenda ? 'Asistencia y Propuesta de Tema' : 'Confirmación de Asistencia',
        message: notifMsg,
        type: finalStatus === 'CONFIRMADA' ? 'success' : 'alert',
        userId: meeting.creatorId,
      });
    }

    return res.json(guest);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};
