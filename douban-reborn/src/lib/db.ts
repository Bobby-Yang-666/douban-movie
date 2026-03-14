import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

declare global {
  var __doubanRebornDb: Database.Database | undefined;
}

function createDatabase() {
  const dataDir = path.join(process.cwd(), "data");

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(path.join(dataDir, "douban-reborn.db"));

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      poster_url TEXT NOT NULL,
      douban_score REAL,
      douban_vote_count INTEGER NOT NULL DEFAULT 0,
      douban_url TEXT NOT NULL,
      release_year TEXT NOT NULL DEFAULT '',
      duration TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      director TEXT NOT NULL DEFAULT '',
      actors TEXT NOT NULL DEFAULT '',
      is_now_playing INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      movie_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      city_slug TEXT NOT NULL,
      city_name TEXT NOT NULL,
      source_count INTEGER NOT NULL DEFAULT 0,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sync_runs_finished_at ON sync_runs(finished_at DESC);
  `);

  return db;
}

export function getDb() {
  if (!global.__doubanRebornDb) {
    global.__doubanRebornDb = createDatabase();
  }

  return global.__doubanRebornDb;
}
