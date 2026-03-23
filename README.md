# StudyFlow AI ⚡

**Turn your notes into flashcards instantly — powered by Claude AI.**

Paste any notes, lecture slides, or textbook content and StudyFlow AI generates targeted flashcards in seconds. Study them using spaced repetition (SM-2 algorithm) so you actually remember what you learn.

---

## Features

- **AI Flashcard Generation** — paste your notes and Claude creates 5–20 precise flashcards automatically
- **Spaced Repetition (SM-2)** — the same algorithm used by Anki; cards you struggle with come back sooner
- **Flip Card Study Mode** — click or press Space to reveal answers, then rate yourself: Again / Hard / Good / Easy
- **Session Statistics** — see your breakdown after every study session
- **Full Card Editor** — edit, delete, or manually add cards to any deck
- **User Accounts** — sign up, log in, your decks are saved to your account
- **Keyboard Shortcuts** — Space to flip, 1–4 to rate cards during study

---

## Screenshots

> Coming soon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite (via `node:sqlite`) |
| AI | Anthropic Claude API (`claude-opus-4-6`) |
| Auth | JWT + bcryptjs |
| Spaced Repetition | SM-2 algorithm |

---

## Getting Started

### Prerequisites

- Node.js 22.5 or higher (uses built-in `node:sqlite`)
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/skippy935/studyflow-ai.git
cd studyflow-ai
npm install
```

### Configuration

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
JWT_SECRET=your-long-random-secret
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Run

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
studyflow-ai/
├── public/                 # Frontend (HTML + JS + CSS)
│   ├── index.html          # Landing page + auth modal
│   ├── dashboard.html      # Deck grid
│   ├── create.html         # Create deck + AI generation
│   ├── deck.html           # View & edit cards
│   ├── study.html          # Study session
│   ├── css/app.css         # Custom styles + flip animation
│   └── js/                 # Vanilla JS per page
├── server/
│   ├── index.js            # Express entry point
│   ├── db.js               # SQLite schema + connection
│   ├── middleware/auth.js  # JWT verification
│   ├── routes/             # API routes (auth, decks, cards, AI)
│   └── services/
│       ├── aiService.js    # Claude API integration
│       └── sm2.js          # Spaced repetition algorithm
└── .env.example
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/decks` | List all decks |
| POST | `/api/ai/generate` | Generate flashcards from notes |
| GET | `/api/decks/:id/due` | Get cards due for review |
| POST | `/api/cards/:id/review` | Submit SM-2 rating |

---

## License

MIT
