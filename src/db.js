const path = require('path');
const Database = require('better-sqlite3');

// Allow overriding the DB file location (used by tests to run in-memory).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'tasks.db');

const db = new Database(DB_PATH);

// Sensible defaults for a small API.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema: one `tasks` table matching the assignment's data model.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);

module.exports = db;
