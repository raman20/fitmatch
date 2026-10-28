const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, 'fitmatch.db'));
db.exec(`
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL,
  name TEXT, age INTEGER, gender TEXT, city TEXT,
  venue TEXT, venue_type TEXT,
  photo TEXT,
  goals TEXT DEFAULT '[]',
  activities TEXT DEFAULT '{}',
  days TEXT DEFAULT '[]', times TEXT DEFAULT '[]',
  bio TEXT DEFAULT '',
  buddy_on INTEGER DEFAULT 0, dating_on INTEGER DEFAULT 0,
  date_genders TEXT DEFAULT '[]', age_min INTEGER DEFAULT 18, age_max INTEGER DEFAULT 99,
  buddy_levels TEXT DEFAULT '[]', min_overlap INTEGER DEFAULT 0,
  is_sample INTEGER DEFAULT 0,
  onboarded INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS swipes (from_id INTEGER, to_id INTEGER, mode TEXT, action TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(from_id,to_id,mode));
CREATE TABLE IF NOT EXISTS matches (id INTEGER PRIMARY KEY AUTOINCREMENT, a INTEGER, b INTEGER, mode TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(a,b,mode));
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE, sender_id INTEGER, body TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS blocks (blocker INTEGER, blocked INTEGER, PRIMARY KEY(blocker,blocked));
CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, reporter INTEGER, reported INTEGER, reason TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
module.exports = db;
