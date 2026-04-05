import { Router } from 'express';
import { Resend } from 'resend';
import { auth, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/support/feedback
router.post('/feedback', auth, async (req: AuthRequest, res) => {
  const { category, message } = req.body || {};
  if (!message?.trim()) { res.status(400).json({ error: 'message required' }); return; }

  try {
    const user = await (prisma.user as any).findUnique({
      where: { id: req.userId! },
      select: { email: true, displayName: true },
    });

    if (process.env.RESEND_API_KEY && process.env.SUPPORT_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'StudyBuild <noreply@studybuild.app>',
        to: process.env.SUPPORT_EMAIL,
        subject: `[${category?.toUpperCase() ?? 'FEEDBACK'}] from ${user?.displayName} <${user?.email}>`,
        html: `
          <p><strong>From:</strong> ${user?.displayName} (${user?.email})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Message:</strong></p>
          <p>${message.trim().replace(/\n/g, '<br/>')}</p>
        `,
      });
    }

    // Log to console as fallback
    console.log(`[SUPPORT] ${category} from ${user?.email}: ${message.trim()}`);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
