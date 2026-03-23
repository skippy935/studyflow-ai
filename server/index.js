require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/decks', require('./routes/deckRoutes'));
app.use('/api', require('./routes/cardRoutes'));
app.use('/api', require('./routes/aiRoutes'));

// Fallback: serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 StudyFlow AI running at http://localhost:${PORT}\n`);
});
