import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerifyEmail(email: string, code: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || 'StudyBuild <noreply@studybuild.app>';
  await resend.emails.send({
    from,
    to: email,
    subject: `${code} — your StudyBuild verification code`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">StudyBuild</h1>
        </div>
        <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px">Hey ${name}, verify your email</h2>
        <p style="color:#64748b;margin:0 0 24px">Enter this 6-digit code in the app. It expires in 15 minutes.</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#4f46e5">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px">If you didn't create a StudyBuild account, ignore this email.</p>
      </div>
    `,
  });
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) { res.status(400).json({ error: 'All fields required' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters' }); return; }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) { res.status(400).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await (prisma.user as any).create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        displayName: name.trim(),
        emailVerified: false,
        verifyCode: code,
        verifyCodeExpiry: expiry,
        verifyAttempts: 0,
      }
    });

    await sendVerifyEmail(user.email, code, name.trim());

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage },
      emailVerified: false,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', auth, async (req: AuthRequest, res) => {
  const { code } = req.body || {};
  if (!code) { res.status(400).json({ error: 'Code required' }); return; }

  try {
    const user = await (prisma.user as any).findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.emailVerified) { res.json({ success: true }); return; }

    if (user.verifyAttempts >= 3) {
      res.status(429).json({ error: 'Too many attempts. Request a new code.' }); return;
    }
    if (!user.verifyCode || !user.verifyCodeExpiry || new Date() > new Date(user.verifyCodeExpiry)) {
      res.status(400).json({ error: 'Code expired. Request a new one.' }); return;
    }
    if (user.verifyCode !== code.trim()) {
      await (prisma.user as any).update({ where: { id: user.id }, data: { verifyAttempts: { increment: 1 } } });
      const remaining = 3 - (user.verifyAttempts + 1);
      res.status(400).json({ error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` }); return;
    }

    await (prisma.user as any).update({
      where: { id: user.id },
      data: { emailVerified: true, verifyCode: null, verifyCodeExpiry: null, verifyAttempts: 0 },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/resend-verify
router.post('/resend-verify', auth, async (req: AuthRequest, res) => {
  try {
    const user = await (prisma.user as any).findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.emailVerified) { res.json({ success: true }); return; }

    const code = generateCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await (prisma.user as any).update({
      where: { id: user.id },
      data: { verifyCode: code, verifyCodeExpiry: expiry, verifyAttempts: 0 },
    });

    await sendVerifyEmail(user.email, code, user.displayName);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend code' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

  try {
    const user = await (prisma.user as any).findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage },
      emailVerified: user.emailVerified ?? true,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    const user = await (prisma.user as any).findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({
      user: {
        id: user.id, email: user.email, displayName: user.displayName,
        uiLanguage: user.uiLanguage, subscriptionTier: user.subscriptionTier,
        emailVerified: user.emailVerified ?? true,
        gradeLevel: user.gradeLevel, schoolType: user.schoolType,
        bundesland: user.bundesland, learningStyle: user.learningStyle,
        preferredStudyTime: user.preferredStudyTime,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/me', auth, async (req: AuthRequest, res) => {
  const { displayName, uiLanguage, currentPassword, newPassword,
          gradeLevel, schoolType, bundesland, learningStyle, preferredStudyTime } = req.body || {};
  try {
    const user = await (prisma.user as any).findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const data: Record<string, unknown> = {};
    if (displayName) data.displayName = displayName.trim();
    if (uiLanguage)  data.uiLanguage  = uiLanguage;
    if (gradeLevel !== undefined)          data.gradeLevel = gradeLevel;
    if (schoolType !== undefined)          data.schoolType = schoolType;
    if (bundesland !== undefined)          data.bundesland = bundesland;
    if (learningStyle !== undefined)       data.learningStyle = learningStyle;
    if (preferredStudyTime !== undefined)  data.preferredStudyTime = preferredStudyTime;

    if (newPassword) {
      if (!currentPassword) { res.status(400).json({ error: 'Current password required' }); return; }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) { res.status(401).json({ error: 'Current password incorrect' }); return; }
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await (prisma.user as any).update({ where: { id: req.userId! }, data });
    res.json({ user: { id: updated.id, email: updated.email, displayName: updated.displayName, uiLanguage: updated.uiLanguage } });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
