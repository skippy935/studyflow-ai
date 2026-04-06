import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AdminRequest extends Request {
  admin?: {
    id: number;
    role: string;
    ip: string;
    device: string;
    tfaConfirmed: boolean;
  };
}

export function adminAuth(minRole: 'MODERATOR' | 'SUPER_ADMIN' = 'MODERATOR') {
  return async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Admin token required' });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        adminId: number;
        role: string;
        tfaConfirmed: boolean;
      };

      const admin = await (prisma as any).admin.findUnique({
        where: { id: payload.adminId },
        select: { id: true, role: true, isActive: true },
      });

      if (!admin || !admin.isActive) {
        res.status(403).json({ error: 'Admin account inactive or not found' });
        return;
      }

      const roleHierarchy: Record<string, number> = { MODERATOR: 1, SUPER_ADMIN: 2 };
      if ((roleHierarchy[admin.role] ?? 0) < (roleHierarchy[minRole] ?? 0)) {
        res.status(403).json({ error: `Requires ${minRole} role` });
        return;
      }

      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress ?? '';
      const device = req.headers['user-agent'] ?? '';

      req.admin = {
        id: admin.id,
        role: admin.role,
        ip,
        device,
        tfaConfirmed: payload.tfaConfirmed ?? false,
      };

      // Update last active
      await (prisma as any).admin.update({
        where: { id: admin.id },
        data: { lastActiveAt: new Date() },
      });

      next();
    } catch {
      res.status(401).json({ error: 'Invalid admin token' });
    }
  };
}
