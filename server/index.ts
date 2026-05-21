import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes     from './routes/auth';
import deckRoutes     from './routes/decks';
import cardRoutes     from './routes/cards';
import quizRoutes     from './routes/quizzes';
import summaryRoutes  from './routes/summaries';
import aiRoutes       from './routes/ai';
import uploadRoutes   from './routes/upload';
import statsRoutes    from './routes/stats';
import examinerRoutes from './routes/examiner';
import extractRoutes  from './routes/extract';
import subjectRoutes  from './routes/subjects';
import plannerRoutes  from './routes/planner';
import tutorRoutes        from './routes/tutor';
import leaderboardRoutes  from './routes/leaderboard';
import teacherRoutes      from './routes/teacher';
import classesRoutes      from './routes/classes';
import parentRoutes       from './routes/parent';
import groupRoutes        from './routes/groups';
import exportRoutes       from './routes/export';
import notificationRoutes from './routes/notifications';
import supportRoutes      from './routes/support';
import promoRoutes        from './routes/promo';
import billingRoutes      from './routes/billing';
import usageRoutes        from './routes/usage';
import kitsRoutes         from './routes/kits';
import stripeWebhookRouter from './routes/webhooks/stripe';
import { startWeeklyEmailCron } from './services/weeklyEmail';

// Admin routes
import adminOverviewRoutes    from './routes/admin/overview';
import adminAuthRoutes        from './routes/admin/auth';
import adminUsersRoutes       from './routes/admin/users';
import adminGdprRoutes        from './routes/admin/gdpr';
import adminFeatureFlagsRoutes from './routes/admin/featureFlags';
import adminAiCostsRoutes     from './routes/admin/aiCosts';
import adminSchoolsRoutes     from './routes/admin/schools';
import adminPromoCodesRoutes  from './routes/admin/promoCodes';
import adminAuditLogRoutes    from './routes/admin/auditLogs';
import adminTeachersRoutes    from './routes/admin/teachers';

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*', credentials: true }));

// Stripe webhook needs raw body — register BEFORE express.json
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString(), uptime: process.uptime() });
});

app.use('/api/auth',      authRoutes);
app.use('/api/decks',     deckRoutes);
app.use('/api/cards',     cardRoutes);
app.use('/api/quizzes',   quizRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/examiner',  examinerRoutes);
app.use('/api/extract',   extractRoutes);
app.use('/api/subjects',  subjectRoutes);
app.use('/api/planner',   plannerRoutes);
app.use('/api/tutor',        tutorRoutes);
app.use('/api/leaderboard',  leaderboardRoutes);
app.use('/api/teacher',      teacherRoutes);
app.use('/api/classes',      classesRoutes);
app.use('/api/parent',       parentRoutes);
app.use('/api/groups',       groupRoutes);
app.use('/api/export',        exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support',       supportRoutes);
app.use('/api/promo',         promoRoutes);
app.use('/api/billing',       billingRoutes);
app.use('/api/usage',         usageRoutes);
app.use('/api/kits',          kitsRoutes);

// Admin
app.use('/api/admin',              adminOverviewRoutes);
app.use('/api/admin/auth',         adminAuthRoutes);
app.use('/api/admin/users',        adminUsersRoutes);
app.use('/api/admin/gdpr',         adminGdprRoutes);
app.use('/api/admin/feature-flags', adminFeatureFlagsRoutes);
app.use('/api/admin/ai-costs',     adminAiCostsRoutes);
app.use('/api/admin/schools',      adminSchoolsRoutes);
app.use('/api/admin/promo-codes',  adminPromoCodesRoutes);
app.use('/api/admin/audit-logs',   adminAuditLogRoutes);
app.use('/api/admin/teachers',     adminTeachersRoutes);

// Serve built React app
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler — must be registered AFTER all routes
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 StudyBuild running on port ${PORT}`);
  startWeeklyEmailCron();
});
