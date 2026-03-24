import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) { res.status(400).json({ error: 'All fields required' }); return; }
  if (password.length < 6) { res.status(400).json({ error: 'Password must be at least 6 characters' }); return; }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(400).json({ error: 'Email already in use' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: email.trim().toLowerCase(), passwordHash, displayName: name.trim() }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid email or password' }); return; }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', auth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user: { id: user.id, email: user.email, displayName: user.displayName, uiLanguage: user.uiLanguage, subscriptionTier: user.subscriptionTier } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/me', auth, async (req: AuthRequest, res) => {
  const { displayName, uiLanguage, currentPassword, newPassword } = req.body || {};
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const data: Record<string, string> = {};
    if (displayName) data.displayName = displayName.trim();
    if (uiLanguage)  data.uiLanguage  = uiLanguage;

    if (newPassword) {
      if (!currentPassword) { res.status(400).json({ error: 'Current password required' }); return; }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) { res.status(401).json({ error: 'Current password incorrect' }); return; }
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({ where: { id: req.userId! }, data });
    res.json({ user: { id: updated.id, email: updated.email, displayName: updated.displayName, uiLanguage: updated.uiLanguage } });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
