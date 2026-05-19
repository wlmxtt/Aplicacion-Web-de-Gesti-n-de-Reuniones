import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getSchools = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
    });

    return res.json(schools);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message || error });
  }
};
