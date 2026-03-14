import { randomUUID } from "node:crypto";

import { getDoubanCity, getSyncStaleMs } from "@/lib/config";
import { getDb } from "@/lib/db";
import { fetchNowPlayingMoviesFromDouban } from "@/lib/douban";
import { createReviewSchema } from "@/lib/validators";
import type {
  CreateReviewInput,
  MovieDetail,
  MovieSummary,
  ReviewRecord,
  SyncPayload,
  SyncRun,
} from "@/lib/types";

type MovieRow = {
  id: string;
  title: string;
  posterUrl: string;
  doubanScore: number | null;
  doubanVoteCount: number;
  doubanUrl: string;
  releaseYear: string;
  duration: string;
  region: string;
  director: string;
  actors: string;
  reviewCount: number;
  communityScore: number | null;
  lastSyncedAt: string;
  isNowPlaying: number;
};

let syncInFlight: Promise<SyncRun> | null = null;

function mapMovieRow(row: MovieRow): MovieSummary {
  return {
    id: row.id,
    title: row.title,
    posterUrl: row.posterUrl,
    doubanScore: row.doubanScore,
    doubanVoteCount: row.doubanVoteCount,
    doubanUrl: row.doubanUrl,
    releaseYear: row.releaseYear,
    duration: row.duration,
    region: row.region,
    director: row.director,
    actors: row.actors,
    reviewCount: row.reviewCount,
    communityScore: row.communityScore,
    lastSyncedAt: row.lastSyncedAt,
    isNowPlaying: Boolean(row.isNowPlaying),
  };
}

function getMovieBaseQuery() {
  return `
    SELECT
      m.id,
      m.title,
      m.poster_url AS posterUrl,
      m.douban_score AS doubanScore,
      m.douban_vote_count AS doubanVoteCount,
      m.douban_url AS doubanUrl,
      m.release_year AS releaseYear,
      m.duration,
      m.region,
      m.director,
      m.actors,
      m.last_synced_at AS lastSyncedAt,
      m.is_now_playing AS isNowPlaying,
      COUNT(r.id) AS reviewCount,
      ROUND(AVG(r.rating), 1) AS communityScore
    FROM movies m
    LEFT JOIN reviews r ON r.movie_id = m.id
  `;
}

function upsertMovies(movies: SyncPayload[]) {
  const db = getDb();
  const now = new Date().toISOString();
  const insertMovie = db.prepare(`
    INSERT INTO movies (
      id,
      title,
      poster_url,
      douban_score,
      douban_vote_count,
      douban_url,
      release_year,
      duration,
      region,
      director,
      actors,
      is_now_playing,
      created_at,
      updated_at,
      last_synced_at
    ) VALUES (
      @id,
      @title,
      @posterUrl,
      @doubanScore,
      @doubanVoteCount,
      @doubanUrl,
      @releaseYear,
      @duration,
      @region,
      @director,
      @actors,
      1,
      @createdAt,
      @updatedAt,
      @lastSyncedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      poster_url = excluded.poster_url,
      douban_score = excluded.douban_score,
      douban_vote_count = excluded.douban_vote_count,
      douban_url = excluded.douban_url,
      release_year = excluded.release_year,
      duration = excluded.duration,
      region = excluded.region,
      director = excluded.director,
      actors = excluded.actors,
      is_now_playing = 1,
      updated_at = excluded.updated_at,
      last_synced_at = excluded.last_synced_at
  `);

  const markAllInactive = db.prepare(`
    UPDATE movies
    SET is_now_playing = 0, updated_at = ?
  `);

  const markActive = db.prepare(`
    UPDATE movies
    SET is_now_playing = 1, updated_at = ?, last_synced_at = ?
    WHERE id = ?
  `);

  const transaction = db.transaction((incomingMovies: SyncPayload[]) => {
    markAllInactive.run(now);

    for (const movie of incomingMovies) {
      insertMovie.run({
        ...movie,
        createdAt: now,
        updatedAt: now,
        lastSyncedAt: now,
      });

      markActive.run(now, now, movie.id);
    }
  });

  transaction(movies);
}

function saveSyncRun(run: SyncRun) {
  const db = getDb();

  db.prepare(`
    INSERT INTO sync_runs (
      id,
      status,
      started_at,
      finished_at,
      city_slug,
      city_name,
      source_count,
      error_message
    ) VALUES (
      @id,
      @status,
      @startedAt,
      @finishedAt,
      @citySlug,
      @cityName,
      @sourceCount,
      @errorMessage
    )
  `).run(run);
}

export async function syncNowPlayingMovies() {
  const startedAt = new Date().toISOString();
  const syncId = randomUUID();

  try {
    const payload = await fetchNowPlayingMoviesFromDouban();
    upsertMovies(payload.movies);

    const run: SyncRun = {
      id: syncId,
      status: "success",
      startedAt,
      finishedAt: new Date().toISOString(),
      citySlug: payload.city.slug,
      cityName: payload.city.name,
      sourceCount: payload.movies.length,
      errorMessage: null,
    };

    saveSyncRun(run);
    return run;
  } catch (error) {
    const city = getDoubanCity();
    const run: SyncRun = {
      id: syncId,
      status: "failed",
      startedAt,
      finishedAt: new Date().toISOString(),
      citySlug: city.slug,
      cityName: city.name,
      sourceCount: 0,
      errorMessage: error instanceof Error ? error.message : "未知同步错误",
    };

    saveSyncRun(run);
    throw error;
  }
}

export function getLatestSyncRun() {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT
        id,
        status,
        started_at AS startedAt,
        finished_at AS finishedAt,
        city_slug AS citySlug,
        city_name AS cityName,
        source_count AS sourceCount,
        error_message AS errorMessage
      FROM sync_runs
      ORDER BY finished_at DESC
      LIMIT 1
    `)
    .get() as SyncRun | undefined;

  return row || null;
}

export async function ensureFreshMovies() {
  const latest = getLatestSyncRun();
  const movieCountRow = getDb()
    .prepare("SELECT COUNT(*) AS count FROM movies WHERE is_now_playing = 1")
    .get() as { count: number };
  const isStale =
    !latest ||
    movieCountRow.count === 0 ||
    Date.now() - new Date(latest.finishedAt).getTime() > getSyncStaleMs();

  if (!isStale) {
    return latest;
  }

  if (!syncInFlight) {
    syncInFlight = syncNowPlayingMovies().finally(() => {
      syncInFlight = null;
    });
  }

  return syncInFlight;
}

export async function getNowPlayingMovies() {
  await ensureFreshMovies();
  const db = getDb();
  const rows = db
    .prepare(
      `
      ${getMovieBaseQuery()}
      WHERE m.is_now_playing = 1
      GROUP BY m.id
      ORDER BY
        CASE WHEN COUNT(r.id) > 0 THEN AVG(r.rating) ELSE 0 END DESC,
        COALESCE(m.douban_score, 0) DESC,
        m.title COLLATE NOCASE ASC
    `,
    )
    .all() as MovieRow[];

  return rows.map(mapMovieRow);
}

export async function getMovieById(id: string): Promise<MovieDetail | null> {
  await ensureFreshMovies();
  const db = getDb();
  const row = db
    .prepare(
      `
      ${getMovieBaseQuery()}
      WHERE m.id = ?
      GROUP BY m.id
    `,
    )
    .get(id) as MovieRow | undefined;

  if (!row) {
    return null;
  }

  const reviews = db
    .prepare(
      `
      SELECT
        id,
        nickname,
        rating,
        content,
        created_at AS createdAt
      FROM reviews
      WHERE movie_id = ?
      ORDER BY created_at DESC
    `,
    )
    .all(id) as ReviewRecord[];

  return {
    ...mapMovieRow(row),
    reviews,
  };
}

export function createReview(movieId: string, input: CreateReviewInput) {
  const parsed = createReviewSchema.parse(input);
  const db = getDb();
  const movie = db.prepare("SELECT id FROM movies WHERE id = ?").get(movieId) as { id: string } | undefined;

  if (!movie) {
    throw new Error("电影不存在，无法提交评论");
  }

  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reviews (
      id,
      movie_id,
      nickname,
      rating,
      content,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), movieId, parsed.nickname, parsed.rating, parsed.content, now, now);
}
