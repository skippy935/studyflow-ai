import cron from 'node-cron';
import { Resend } from 'resend';
import prisma from '../lib/prisma';
import { levelFromXP } from './gamification';

const FROM = process.env.EMAIL_FROM || 'StudyFlow <noreply@studyflow.app>';

async function sendWeeklyEmails() {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const users = await (prisma.user as any).findMany({
    select: { id: true, email: true, displayName: true, xp: true, streak: true, totalCardsLearned: true },
  });

  for (const user of users) {
    try {
      const [sessions, decksCount] = await Promise.all([
        prisma.studySession.findMany({
          where: { userId: user.id, studiedAt: { gte: since } },
          select: { cardsStudied: true },
        }),
        prisma.deck.count({ where: { userId: user.id } }),
      ]);

      const cardsThisWeek = sessions.reduce((sum: number, s: { cardsStudied: number }) => sum + s.cardsStudied, 0);
      const level = levelFromXP(user.xp ?? 0);
      const name = user.displayName || user.email.split('@')[0];

      const html = buildEmailHtml({ name, cardsThisWeek, streak: user.streak ?? 0, level, decksCount, xp: user.xp ?? 0 });

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: cardsThisWeek > 0
          ? `📚 You studied ${cardsThisWeek} cards this week!`
          : '📚 Your weekly StudyFlow summary',
        html,
      });
    } catch (err) {
      console.error(`Weekly email failed for ${user.email}:`, err);
    }
  }
  console.log(`Weekly emails sent to ${users.length} users.`);
}

function buildEmailHtml({ name, cardsThisWeek, streak, level, decksCount, xp }: {
  name: string; cardsThisWeek: number; streak: number; level: number; decksCount: number; xp: number;
}) {
  const encouragement = cardsThisWeek === 0
    ? "It's been a quiet week — your notes are waiting for you!"
    : cardsThisWeek < 20
    ? "Good start this week. Keep the momentum going!"
    : "Great week of studying! You're making real progress.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">📚 StudyFlow</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px">Your weekly progress report</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:18px;font-weight:700;color:#1e293b;margin:0 0 4px">Hey ${name}!</p>
      <p style="color:#64748b;margin:0 0 24px;font-size:14px">${encouragement}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:28px;font-weight:800;color:#3b82f6;margin:0">${cardsThisWeek}</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0">Cards this week</p>
        </div>
        <div style="background:#fff7ed;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:28px;font-weight:800;color:#f97316;margin:0">${streak} 🔥</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0">Day streak</p>
        </div>
        <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:28px;font-weight:800;color:#22c55e;margin:0">Lv.${level}</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0">${xp} XP total</p>
        </div>
        <div style="background:#faf5ff;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:28px;font-weight:800;color:#a855f7;margin:0">${decksCount}</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0">Decks created</p>
        </div>
      </div>
      <a href="${process.env.APP_URL || 'https://studyflow.app'}/dashboard"
         style="display:block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px">
        Continue studying →
      </a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center">
      <p style="font-size:12px;color:#94a3b8;margin:0">You're receiving this because you have a StudyFlow account.</p>
    </div>
  </div>
</body>
</html>`;
}

// Schedule: every Monday at 8:00 AM UTC
export function startWeeklyEmailCron() {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — weekly emails disabled');
    return;
  }
  cron.schedule('0 8 * * 1', sendWeeklyEmails, { timezone: 'UTC' });
  console.log('Weekly email cron scheduled (Mon 08:00 UTC)');
}
