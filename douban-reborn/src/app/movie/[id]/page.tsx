import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquareText, Star } from "lucide-react";

import { ReviewForm } from "@/components/review-form";
import { formatAbsoluteDate, formatRelativeTime, formatScore, formatVotes } from "@/lib/format";
import { getMovieById } from "@/lib/movies";

export const dynamic = "force-dynamic";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    return {
      title: "电影不存在 | 映场",
    };
  }

  return {
    title: `${movie.title} | 映场`,
    description: `${movie.title} 的社区评分、评论与豆瓣上映信息。`,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm text-white/82 transition hover:border-white/30 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          返回映场首页
        </Link>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/12 bg-[#150909]/78 shadow-[0_40px_120px_rgba(0,0,0,0.26)]">
          <div className="absolute inset-0">
            <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover opacity-16 blur-md" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,178,106,0.24),transparent_36%),linear-gradient(140deg,rgba(11,6,6,0.94),rgba(11,6,6,0.78))]" />
          </div>

          <div className="relative grid gap-8 p-6 lg:grid-cols-[320px_1fr] lg:p-10">
            <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-[3/4]">
                <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" sizes="(max-width: 1024px) 80vw, 320px" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex rounded-full border border-[#f7b26a]/35 bg-[#f7b26a]/12 px-4 py-1 text-xs tracking-[0.35em] text-[#f8cf9e] uppercase">
                  正在上映
                </div>
                <h1 className="font-display text-5xl leading-none text-white sm:text-6xl">{movie.title}</h1>
                <p className="max-w-3xl text-base leading-8 text-white/72">
                  导演：{movie.director || "待同步"} | 演员：{movie.actors || "待同步"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                  <div className="text-xs tracking-[0.3em] text-white/45 uppercase">豆瓣参考分</div>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-[#ffd19a]">{formatScore(movie.doubanScore)}</span>
                    <span className="pb-1 text-sm text-white/52">{formatVotes(movie.doubanVoteCount)} 人</span>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                  <div className="text-xs tracking-[0.3em] text-white/45 uppercase">社区评分</div>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-[#8ce0cf]">{formatScore(movie.communityScore)}</span>
                    <span className="pb-1 text-sm text-white/52">{movie.reviewCount} 条评论</span>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                  <div className="text-xs tracking-[0.3em] text-white/45 uppercase">最近同步</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{formatRelativeTime(movie.lastSyncedAt)}</div>
                  <div className="mt-2 text-sm text-white/52">{formatAbsoluteDate(movie.lastSyncedAt)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-white/78">
                <span className="rounded-full border border-white/12 bg-black/22 px-4 py-2">{movie.releaseYear || "年份待定"}</span>
                <span className="rounded-full border border-white/12 bg-black/22 px-4 py-2">{movie.region || "地区待定"}</span>
                <span className="rounded-full border border-white/12 bg-black/22 px-4 py-2">{movie.duration || "时长待定"}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={movie.doubanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm text-white transition hover:border-white/30 hover:bg-white/12"
                >
                  查看豆瓣原页
                </a>
                <a
                  href="#reviews"
                  className="inline-flex items-center rounded-full bg-[#f7b26a] px-5 py-3 text-sm font-semibold text-[#24150f] transition hover:brightness-105"
                >
                  写评论
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/12 bg-white/6 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.2)] backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs tracking-[0.3em] text-[#8ce0cf] uppercase">社区评论</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">观众怎么说</h2>
              </div>
              <div className="rounded-full border border-white/12 bg-black/22 px-4 py-2 text-sm text-white/74">
                {movie.reviewCount} 条评论
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {movie.reviews.length > 0 ? (
                movie.reviews.map((review) => (
                  <article key={review.id} className="rounded-[1.6rem] border border-white/10 bg-black/18 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8ce0cf]/15 text-sm font-semibold text-[#8ce0cf]">
                          {review.nickname.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{review.nickname}</div>
                          <div className="text-sm text-white/48">{formatRelativeTime(review.createdAt)}</div>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#f7b26a]/35 bg-[#f7b26a]/10 px-3 py-1 text-sm text-[#ffd19a]">
                        <Star className="h-4 w-4 fill-current" />
                        {review.rating.toFixed(1)}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/74">{review.content}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-black/18 p-8 text-center">
                  <MessageSquareText className="mx-auto h-10 w-10 text-white/28" />
                  <p className="mt-4 text-lg font-medium text-white">还没有社区评论</p>
                  <p className="mt-2 text-sm text-white/54">你可以成为第一位留下评分和观点的人。</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <ReviewForm movieId={movie.id} />
          </div>
        </section>
      </div>
    </main>
  );
}
