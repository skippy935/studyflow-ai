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

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',      authRoutes);
app.use('/api/decks',     deckRoutes);
app.use('/api/cards',     cardRoutes);
app.use('/api/quizzes',   quizRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/upload',    uploadRoutes);

// Serve built React app
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 StudyBuild running at http://localhost:${PORT}`);
});
