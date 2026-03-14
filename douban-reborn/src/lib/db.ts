import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __doubanRebornPool: Pool | undefined;
  var __doubanRebornInitPromise: Promise<void> | undefined;
}

function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

function createPool() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error(
      "缺少 Postgres 连接串。请配置 POSTGRES_URL 或 DATABASE_URL，然后再运行项目。",
    );
  }

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getDb() {
  if (!global.__doubanRebornPool) {
    global.__doubanRebornPool = createPool();
  }

  return global.__doubanRebornPool;
}

async function initializeSchema() {
  const db = getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      poster_url TEXT NOT NULL,
      douban_score DOUBLE PRECISION,
      douban_vote_count INTEGER NOT NULL DEFAULT 0,
      douban_url TEXT NOT NULL,
      release_year TEXT NOT NULL DEFAULT '',
      duration TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      director TEXT NOT NULL DEFAULT '',
      actors TEXT NOT NULL DEFAULT '',
      is_now_playing BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      last_synced_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      nickname TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
      started_at TIMESTAMPTZ NOT NULL,
      finished_at TIMESTAMPTZ NOT NULL,
      city_slug TEXT NOT NULL,
      city_name TEXT NOT NULL,
      source_count INTEGER NOT NULL DEFAULT 0,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sync_runs_finished_at ON sync_runs(finished_at DESC);
  `);
}

export async function ensureDbReady() {
  if (!global.__doubanRebornInitPromise) {
    global.__doubanRebornInitPromise = initializeSchema();
  }

  await global.__doubanRebornInitPromise;
}

type Queryable = Pool | PoolClient;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
  client?: Queryable,
) {
  await ensureDbReady();
  return (client ?? getDb()).query<T>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  await ensureDbReady();
  const client = await getDb().connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function firstRow<T extends QueryResultRow>(result: QueryResult<T>) {
  return result.rows[0] || null;
}
