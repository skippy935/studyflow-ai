require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/decks',     require('./routes/deckRoutes'));
app.use('/api',           require('./routes/cardRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));
app.use('/api/quizzes',   require('./routes/quizRoutes'));
app.use('/api/summaries', require('./routes/summaryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/extract',  require('./routes/extractRoutes'));
app.use('/api/examiner', require('./routes/examinerRoutes'));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 StudyBuild running at http://localhost:${PORT}\n`);
});
