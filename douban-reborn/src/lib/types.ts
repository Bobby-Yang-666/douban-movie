export type MovieSummary = {
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
  isNowPlaying: boolean;
};

export type ReviewRecord = {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type MovieDetail = MovieSummary & {
  reviews: ReviewRecord[];
};

export type SyncRun = {
  id: string;
  status: "success" | "failed";
  startedAt: string;
  finishedAt: string;
  citySlug: string;
  cityName: string;
  sourceCount: number;
  errorMessage: string | null;
};

export type SyncPayload = {
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
};

export type CreateReviewInput = {
  nickname: string;
  rating: number;
  content: string;
};
