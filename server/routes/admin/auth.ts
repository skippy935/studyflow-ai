import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';

const router = Router();
const p = prisma as any;

// POST /api/admin/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

  try {
    const admin = await p.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin || !admin.isActive) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    // Issue token — tfaConfirmed false until 2FA step
    const token = jwt.sign(
      { adminId: admin.id, role: admin.role, tfaConfirmed: !admin.tfaEnabled },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    await p.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

    res.json({
      token,
      requiresTfa: admin.tfaEnabled,
      admin: { id: admin.id, email: admin.email, displayName: admin.displayName, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/auth/me
router.get('/me', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const admin = await p.admin.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, email: true, displayName: true, role: true, tfaEnabled: true, lastLoginAt: true },
    });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/auth/invite — Super Admin only
router.post('/invite', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const { email, role, notes } = req.body ?? {};
  if (!email || !role) { res.status(400).json({ error: 'email and role required' }); return; }
  if (!['SUPER_ADMIN', 'MODERATOR'].includes(role)) { res.status(400).json({ error: 'Invalid role' }); return; }

  try {
    const existing = await p.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) { res.status(409).json({ error: 'Admin with this email already exists' }); return; }

    const inviteToken = require('crypto').randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await p.admin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: '',
        role,
        inviteToken,
        inviteExpiry: expiry,
        inviteAccepted: false,
        isActive: false,
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'ADMIN_INVITE',
      reason: `Invited ${email} as ${role}. Notes: ${notes ?? ''}`,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    // In production: send invite email. For now return token.
    res.json({ ok: true, inviteToken, inviteUrl: `/admin/accept-invite?token=${inviteToken}` });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/auth/accept-invite
router.post('/accept-invite', async (req: Request, res: Response) => {
  const { token, password, displayName } = req.body ?? {};
  if (!token || !password) { res.status(400).json({ error: 'token and password required' }); return; }
  if (password.length < 16) { res.status(400).json({ error: 'Password must be at least 16 characters' }); return; }

  try {
    const admin = await p.admin.findUnique({ where: { inviteToken: token } });
    if (!admin || admin.inviteAccepted) { res.status(400).json({ error: 'Invalid or expired invite' }); return; }
    if (admin.inviteExpiry && new Date(admin.inviteExpiry) < new Date()) {
      res.status(400).json({ error: 'Invite has expired' }); return;
    }

    const hash = await bcrypt.hash(password, 12);
    await p.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: hash,
        displayName: displayName ?? '',
        inviteToken: null,
        inviteAccepted: true,
        isActive: true,
      },
    });

    res.json({ ok: true, message: 'Account activated. Please set up 2FA.' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/auth/admins — list all admins (Super Admin only)
router.get('/admins', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  try {
    const admins = await p.admin.findMany({
      select: {
        id: true, email: true, displayName: true, role: true,
        tfaEnabled: true, isActive: true, lastLoginAt: true,
        inviteAccepted: true, inviteExpiry: true, createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/auth/create-admin — directly create an active admin (SUPER_ADMIN only)
router.post('/create-admin', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const { email, password, displayName, role } = req.body ?? {};
  if (!email || !password || !displayName || !role) {
    res.status(400).json({ error: 'email, password, displayName and role are required' }); return;
  }
  if (!['SUPER_ADMIN', 'MODERATOR'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' }); return;
  }
  if (password.length < 16) {
    res.status(400).json({ error: 'Password must be at least 16 characters' }); return;
  }

  try {
    const existing = await p.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) { res.status(409).json({ error: 'Admin with this email already exists' }); return; }

    const hash = await bcrypt.hash(password, 12);
    const admin = await p.admin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hash,
        displayName,
        role,
        isActive: true,
        inviteAccepted: true,
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'ADMIN_CREATED',
      reason: `Directly created admin ${email} as ${role}`,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.status(201).json({
      ok: true,
      admin: { id: admin.id, email: admin.email, displayName: admin.displayName, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/auth/admins/:id — update role or active state (SUPER_ADMIN only)
router.patch('/admins/:id', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const targetId = parseInt(req.params.id);
  const { role, isActive } = req.body ?? {};

  if (targetId === req.admin!.id) {
    res.status(400).json({ error: 'Cannot modify your own account here' }); return;
  }

  try {
    const target = await p.admin.findUnique({ where: { id: targetId } });
    if (!target) { res.status(404).json({ error: 'Admin not found' }); return; }

    const data: any = {};
    if (role && ['SUPER_ADMIN', 'MODERATOR'].includes(role)) data.role = role;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    await p.admin.update({ where: { id: targetId }, data });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'ADMIN_UPDATED',
      reason: `Updated admin ${target.email}: ${JSON.stringify(data)}`,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/admin/auth/admins/:id — deactivate admin (SUPER_ADMIN only)
router.delete('/admins/:id', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.admin!.id) {
    res.status(400).json({ error: 'Cannot deactivate your own account' }); return;
  }

  try {
    const target = await p.admin.findUnique({ where: { id: targetId } });
    if (!target) { res.status(404).json({ error: 'Admin not found' }); return; }

    await p.admin.update({ where: { id: targetId }, data: { isActive: false } });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'ADMIN_DEACTIVATED',
      reason: `Deactivated admin ${target.email}`,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
