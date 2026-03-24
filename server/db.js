const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'studybuild.db'));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    name        TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS decks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    color       TEXT    DEFAULT '#4F46E5',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cards (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id      INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front        TEXT    NOT NULL,
    back         TEXT    NOT NULL,
    difficulty   TEXT    NOT NULL DEFAULT 'medium',
    easiness     REAL    NOT NULL DEFAULT 2.5,
    interval     INTEGER NOT NULL DEFAULT 1,
    repetitions  INTEGER NOT NULL DEFAULT 0,
    next_review  TEXT    NOT NULL DEFAULT (date('now')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    topic       TEXT    DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quiz_questions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    type          TEXT    NOT NULL DEFAULT 'multiple_choice',
    question      TEXT    NOT NULL,
    options       TEXT    DEFAULT NULL,
    correct       TEXT    DEFAULT NULL,
    explanation   TEXT    DEFAULT '',
    sample_answer TEXT    DEFAULT '',
    keywords      TEXT    DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS summaries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    topic       TEXT    DEFAULT '',
    content     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id       INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    cards_studied INTEGER NOT NULL DEFAULT 0,
    again_count   INTEGER NOT NULL DEFAULT 0,
    hard_count    INTEGER NOT NULL DEFAULT 0,
    good_count    INTEGER NOT NULL DEFAULT 0,
    easy_count    INTEGER NOT NULL DEFAULT 0,
    studied_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_cards_deck_id     ON cards(deck_id);
  CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(next_review);
  CREATE INDEX IF NOT EXISTS idx_decks_user_id     ON decks(user_id);
  CREATE INDEX IF NOT EXISTS idx_quizzes_user_id   ON quizzes(user_id);
  CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
`);

module.exports = db;
