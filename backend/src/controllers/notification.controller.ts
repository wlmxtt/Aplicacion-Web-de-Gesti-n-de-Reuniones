import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { NotificationType } from '@prisma/client';

// Helper: create a notification (used internally by other controllers)
export const createNotification = async (data: {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  userId?: string | null;
}) => {
  const typeMap: Record<string, NotificationType> = {
    info: 'INFO',
    success: 'SUCCESS',
    warning: 'WARNING',
    alert: 'ALERT',
  };

  return prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: typeMap[data.type] || 'INFO',
      userId: data.userId || null,
    },
  });
};

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get notifications for this user OR global notifications (userId is null)
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Map to frontend format
    const mapped = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      date: n.createdAt.toISOString(),
      type: n.type.toLowerCase() as 'info' | 'success' | 'warning' | 'alert',
      read: n.read,
    }));

    return res.json(mapped);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};

// POST /api/notifications/read-all
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { userId: null },
        ],
        read: false,
      },
      data: { read: true },
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};
