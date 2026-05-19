import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// Helper: create an audit log entry (used internally)
export const createAuditLogEntry = async (action: string, userEmail: string, ip?: string) => {
  return prisma.auditLog.create({
    data: {
      action: action.toUpperCase(),
      userEmail,
      ip: ip || null,
    },
  });
};

// GET /api/audit-logs
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Map to the format the frontend expects
    const mapped = logs.map((log) => ({
      id: log.id,
      action: log.action,
      user: log.userEmail,
      date: log.createdAt.toISOString(),
      ip: log.ip || '0.0.0.0',
    }));

    return res.json(mapped);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};

// POST /api/audit-logs
export const addAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const { action, user } = req.body;

    if (!action || !user) {
      return res.status(400).json({ message: 'action and user are required' });
    }

    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';

    const log = await createAuditLogEntry(action, user, ip);

    return res.status(201).json({
      id: log.id,
      action: log.action,
      user: log.userEmail,
      date: log.createdAt.toISOString(),
      ip: log.ip,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};
