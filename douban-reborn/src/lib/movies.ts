import { randomUUID } from "node:crypto";

import type { QueryResultRow } from "pg";

import { getDoubanCity, getSyncStaleMs } from "@/lib/config";
import { firstRow, query, withTransaction } from "@/lib/db";
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

type TimestampValue = string | Date;

type MovieRow = QueryResultRow & {
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
  lastSyncedAt: TimestampValue;
  isNowPlaying: boolean;
};

type ReviewRow = QueryResultRow & {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  createdAt: TimestampValue;
};

type SyncRunRow = QueryResultRow & {
  id: string;
  status: "success" | "failed";
  startedAt: TimestampValue;
  finishedAt: TimestampValue;
  citySlug: string;
  cityName: string;
  sourceCount: number;
  errorMessage: string | null;
};

let syncInFlight: Promise<SyncRun> | null = null;

function toIsoString(value: TimestampValue) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapMovieRow(row: MovieRow): MovieSummary {
  return {
    id: row.id,
    title: row.title,
    posterUrl: row.posterUrl,
    doubanScore: row.doubanScore,
    doubanVoteCount: Number(row.doubanVoteCount),
    doubanUrl: row.doubanUrl,
    releaseYear: row.releaseYear,
    duration: row.duration,
    region: row.region,
    director: row.director,
    actors: row.actors,
    reviewCount: Number(row.reviewCount),
    communityScore: row.communityScore,
    lastSyncedAt: toIsoString(row.lastSyncedAt),
    isNowPlaying: Boolean(row.isNowPlaying),
  };
}

function mapSyncRunRow(row: SyncRunRow): SyncRun {
  return {
    id: row.id,
    status: row.status,
    startedAt: toIsoString(row.startedAt),
    finishedAt: toIsoString(row.finishedAt),
    citySlug: row.citySlug,
    cityName: row.cityName,
    sourceCount: Number(row.sourceCount),
    errorMessage: row.errorMessage,
  };
}

function getMovieBaseQuery() {
  return `
    SELECT
      m.id,
      m.title,
      m.poster_url AS "posterUrl",
      m.douban_score AS "doubanScore",
      m.douban_vote_count AS "doubanVoteCount",
      m.douban_url AS "doubanUrl",
      m.release_year AS "releaseYear",
      m.duration,
      m.region,
      m.director,
      m.actors,
      m.last_synced_at AS "lastSyncedAt",
      m.is_now_playing AS "isNowPlaying",
      COUNT(r.id)::int AS "reviewCount",
      ROUND(AVG(r.rating)::numeric, 1)::float8 AS "communityScore"
    FROM movies m
    LEFT JOIN reviews r ON r.movie_id = m.id
  `;
}

async function upsertMovies(movies: SyncPayload[]) {
  const now = new Date();

  await withTransaction(async (client) => {
    await query("UPDATE movies SET is_now_playing = FALSE, updated_at = $1", [now], client);

    for (const movie of movies) {
      await query(
        `
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
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12, $12, $12
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            poster_url = EXCLUDED.poster_url,
            douban_score = EXCLUDED.douban_score,
            douban_vote_count = EXCLUDED.douban_vote_count,
            douban_url = EXCLUDED.douban_url,
            release_year = EXCLUDED.release_year,
            duration = EXCLUDED.duration,
            region = EXCLUDED.region,
            director = EXCLUDED.director,
            actors = EXCLUDED.actors,
            is_now_playing = TRUE,
            updated_at = EXCLUDED.updated_at,
            last_synced_at = EXCLUDED.last_synced_at
        `,
        [
          movie.id,
          movie.title,
          movie.posterUrl,
          movie.doubanScore,
          movie.doubanVoteCount,
          movie.doubanUrl,
          movie.releaseYear,
          movie.duration,
          movie.region,
          movie.director,
          movie.actors,
          now,
        ],
        client,
      );
    }
  });
}

async function saveSyncRun(run: SyncRun) {
  await query(
    `
      INSERT INTO sync_runs (
        id,
        status,
        started_at,
        finished_at,
        city_slug,
        city_name,
        source_count,
        error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      run.id,
      run.status,
      run.startedAt,
      run.finishedAt,
      run.citySlug,
      run.cityName,
      run.sourceCount,
      run.errorMessage,
    ],
  );
}

export async function syncNowPlayingMovies() {
  const startedAt = new Date().toISOString();
  const syncId = randomUUID();

  try {
    const payload = await fetchNowPlayingMoviesFromDouban();
    await upsertMovies(payload.movies);

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

    await saveSyncRun(run);
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

    await saveSyncRun(run);
    throw error;
  }
}

export async function getLatestSyncRun() {
  const result = await query<SyncRunRow>(
    `
      SELECT
        id,
        status,
        started_at AS "startedAt",
        finished_at AS "finishedAt",
        city_slug AS "citySlug",
        city_name AS "cityName",
        source_count AS "sourceCount",
        error_message AS "errorMessage"
      FROM sync_runs
      ORDER BY finished_at DESC
      LIMIT 1
    `,
  );

  const row = firstRow(result);
  return row ? mapSyncRunRow(row) : null;
}

export async function ensureFreshMovies() {
  const latest = await getLatestSyncRun();
  const movieCountResult = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM movies WHERE is_now_playing = TRUE",
  );
  const countRow = firstRow(movieCountResult);
  const movieCount = Number(countRow?.count || 0);
  const isStale =
    !latest ||
    movieCount === 0 ||
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
  const result = await query<MovieRow>(
    `
      ${getMovieBaseQuery()}
      WHERE m.is_now_playing = TRUE
      GROUP BY m.id
      ORDER BY
        CASE WHEN COUNT(r.id) > 0 THEN AVG(r.rating) ELSE 0 END DESC,
        COALESCE(m.douban_score, 0) DESC,
        m.title ASC
    `,
  );

  return result.rows.map(mapMovieRow);
}

export async function getMovieById(id: string): Promise<MovieDetail | null> {
  await ensureFreshMovies();
  const movieResult = await query<MovieRow>(
    `
      ${getMovieBaseQuery()}
      WHERE m.id = $1
      GROUP BY m.id
    `,
    [id],
  );
  const movieRow = firstRow(movieResult);

  if (!movieRow) {
    return null;
  }

  const reviewResult = await query<ReviewRow>(
    `
      SELECT
        id,
        nickname,
        rating,
        content,
        created_at AS "createdAt"
      FROM reviews
      WHERE movie_id = $1
      ORDER BY created_at DESC
    `,
    [id],
  );

  const reviews: ReviewRecord[] = reviewResult.rows.map((review) => ({
    id: review.id,
    nickname: review.nickname,
    rating: Number(review.rating),
    content: review.content,
    createdAt: toIsoString(review.createdAt),
  }));

  return {
    ...mapMovieRow(movieRow),
    reviews,
  };
}

export async function createReview(movieId: string, input: CreateReviewInput) {
  const parsed = createReviewSchema.parse(input);
  const movieResult = await query<{ id: string }>("SELECT id FROM movies WHERE id = $1", [movieId]);
  const movie = firstRow(movieResult);

  if (!movie) {
    throw new Error("电影不存在，无法提交评论");
  }

  const now = new Date().toISOString();

  await query(
    `
      INSERT INTO reviews (
        id,
        movie_id,
        nickname,
        rating,
        content,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $6)
    `,
    [randomUUID(), movieId, parsed.nickname, parsed.rating, parsed.content, now],
  );
}
