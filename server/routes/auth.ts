import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { featureGuard } from '../middleware/featureGuard';

const router = Router();
const p = prisma as any;

// ── Password strength check ───────────────────────────────────────────────────
function isStrongPassword(pw: string): string | null {
  if (pw.length < 8)              return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))         return 'Password must include an uppercase letter';
  if (!/[a-z]/.test(pw))         return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(pw))         return 'Password must include a number';
  if (!/[^A-Za-z0-9]/.test(pw))  return 'Password must include a special character';
  return null;
}

// ── POST /auth/register/student ───────────────────────────────────────────────
router.post('/register/student', featureGuard('user_registration'), async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields required' }); return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' }); return;
  }
  try {
    const existing = await p.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) { res.status(400).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await p.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        displayName: name.trim(),
        emailVerified: true,
        userType: 'student',
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage, userType: user.userType },
    });
  } catch (err) {
    console.error('Student register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /auth/register/teacher ───────────────────────────────────────────────
router.post('/register/teacher', featureGuard('user_registration'), async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields required' }); return;
  }
  const pwError = isStrongPassword(password);
  if (pwError) { res.status(400).json({ error: pwError }); return; }

  try {
    const existing = await p.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) { res.status(400).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await p.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        displayName: name.trim(),
        emailVerified: true,
        userType: 'teacher',
      },
    });

    // Create teacher profile with pending status
    await p.teacherProfile.create({
      data: { userId: user.id, verificationStatus: 'pending' },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage, userType: user.userType },
      teacherStatus: 'pending', // profile incomplete
    });
  } catch (err) {
    console.error('Teacher register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /auth/register (legacy — keeps existing student flow working) ─────────
router.post('/register', featureGuard('user_registration'), async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) { res.status(400).json({ error: 'All fields required' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters' }); return; }

  try {
    const existing = await p.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) { res.status(400).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await p.user.create({
      data: { email: email.trim().toLowerCase(), passwordHash, displayName: name.trim(), emailVerified: true },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /auth/login ───────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

  try {
    const user = await p.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { teacherProfile: true },
    });
    if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    if (user.isBanned) {
      res.status(403).json({ error: 'Account suspended. Contact support.' }); return;
    }

    // Teacher approval gate
    if (user.userType === 'teacher' && user.teacherProfile) {
      const status = user.teacherProfile.verificationStatus;
      if (status === 'pending') {
        // Profile incomplete — let them in to complete it
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
        res.json({
          token,
          user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage, userType: user.userType },
          teacherStatus: 'pending',
          redirect: '/teacher/onboarding',
        });
        return;
      }
      if (status === 'rejected') {
        res.status(403).json({
          error: 'Your teacher application was not approved.',
          reason: user.teacherProfile.rejectionReason || '',
          teacherStatus: 'rejected',
        });
        return;
      }
    }

    // Fix any stuck emailVerified false
    if (!user.emailVerified) {
      await p.user.update({ where: { id: user.id }, data: { emailVerified: true, verifyCode: null, verifyCodeExpiry: null } });
    }
    await p.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage, userType: user.userType },
      teacherStatus: user.teacherProfile?.verificationStatus ?? null,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /auth/me ───────────────────────────────────────────────────────────────
router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    const user = await p.user.findUnique({
      where: { id: req.userId! },
      include: { teacherProfile: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({
      user: {
        id: user.id, email: user.email, displayName: user.displayName,
        uiLanguage: user.uiLanguage, subscriptionTier: user.subscriptionTier,
        emailVerified: true, userType: user.userType,
        gradeLevel: user.gradeLevel, schoolType: user.schoolType,
        bundesland: user.bundesland, learningStyle: user.learningStyle,
        preferredStudyTime: user.preferredStudyTime, neuroMode: user.neuroMode,
        xp: user.xp, streak: user.streak, badges: user.badges,
      },
      teacherStatus: user.teacherProfile?.verificationStatus ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── PUT /auth/me ───────────────────────────────────────────────────────────────
router.put('/me', auth, async (req: AuthRequest, res) => {
  const { displayName, uiLanguage, currentPassword, newPassword,
          gradeLevel, schoolType, bundesland, learningStyle, preferredStudyTime,
          neuroMode } = req.body || {};
  try {
    const user = await p.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const data: Record<string, unknown> = {};
    if (displayName) data.displayName = displayName.trim();
    if (uiLanguage)  data.uiLanguage  = uiLanguage;
    if (gradeLevel !== undefined)         data.gradeLevel = gradeLevel;
    if (schoolType !== undefined)         data.schoolType = schoolType;
    if (bundesland !== undefined)         data.bundesland = bundesland;
    if (learningStyle !== undefined)      data.learningStyle = learningStyle;
    if (preferredStudyTime !== undefined) data.preferredStudyTime = preferredStudyTime;
    if (neuroMode !== undefined)          data.neuroMode = neuroMode;

    if (newPassword) {
      if (!currentPassword) { res.status(400).json({ error: 'Current password required' }); return; }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) { res.status(401).json({ error: 'Current password incorrect' }); return; }
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await p.user.update({ where: { id: req.userId! }, data });
    res.json({ user: { id: updated.id, email: updated.email, displayName: updated.displayName, uiLanguage: updated.uiLanguage, neuroMode: updated.neuroMode, subscriptionTier: updated.subscriptionTier } });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// ── DELETE /auth/me ────────────────────────────────────────────────────────────
router.delete('/me', auth, async (req: AuthRequest, res) => {
  try {
    await p.user.delete({ where: { id: req.userId! } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

export default router;
