import Image from "next/image";
import Link from "next/link";
import { Clock3, MessageSquareMore, Sparkles, Star } from "lucide-react";

import { MovieCard } from "@/components/movie-card";
import { formatAbsoluteDate, formatRelativeTime, formatScore } from "@/lib/format";
import { getLatestSyncRun, getNowPlayingMovies } from "@/lib/movies";

export const dynamic = "force-dynamic";

function averageScore(scores: number[]) {
  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, value) => sum + value, 0);
  return total / scores.length;
}

export default async function Home() {
  const movies = await getNowPlayingMovies();
  const latestSync = getLatestSyncRun();
  const featured = movies[0];
  const reviewedMovies = movies.filter((movie) => movie.reviewCount > 0);
  const communityHighlights = reviewedMovies.slice(0, 3);
  const averageDouban = averageScore(
    movies.map((movie) => movie.doubanScore).filter((score): score is number => score !== null),
  );
  const averageCommunity = averageScore(
    reviewedMovies.map((movie) => movie.communityScore).filter((score): score is number => score !== null),
  );

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 py-4 sm:py-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/12 bg-[#140808]/78 shadow-[0_40px_120px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,178,106,0.28),transparent_30%),radial-gradient(circle_at_left,rgba(140,224,207,0.12),transparent_26%),linear-gradient(135deg,rgba(10,5,5,0.95),rgba(17,9,9,0.84))]" />
          <div className="relative grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div className="space-y-8">
              <div className="inline-flex rounded-full border border-[#f7b26a]/35 bg-[#f7b26a]/10 px-4 py-1 text-xs tracking-[0.35em] text-[#f8cf9e] uppercase">
                豆瓣失真后的替代片场
              </div>

              <div className="space-y-4">
                <h1 className="font-display max-w-4xl text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
                  让电影重新回到
                  <span className="text-[#f7b26a]">真实口碑</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                  映场会自动同步豆瓣“正在上映”片单，用更轻量、更直接的方式收集观众评分与评论。豆瓣分数只是参考，社区口碑才是主角。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#movies"
                  className="inline-flex items-center rounded-full bg-[#f7b26a] px-5 py-3 text-sm font-semibold text-[#24150f] transition hover:brightness-105"
                >
                  浏览正在上映
                </a>
                {featured ? (
                  <Link
                    href={`/movie/${featured.id}`}
                    className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm text-white transition hover:border-white/30 hover:bg-white/12"
                  >
                    进入本周焦点《{featured.title}》
                  </Link>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                  <div className="text-xs tracking-[0.3em] text-white/45 uppercase">上映电影</div>
                  <div className="mt-3 text-4xl font-semibold text-white">{movies.length}</div>
                  <div className="mt-2 text-sm text-white/55">自动取自 {latestSync?.cityName || "北京"} 正在上映</div>
                </div>
                <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                  <div className="text-xs tracking-[0.3em] text-white/45 uppercase">豆瓣均分</div>
                  <div className="mt-3 text-4xl font-semibold text-[#ffd19a]">{formatScore(averageDouban)}</div>
                  <div className="mt-2 text-sm text-white/55">只作为参考，不作为本站排序标准</div>
                </div>
                <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
                  <div className="text-xs tracking-[0.3em] text-white/45 uppercase">社区均分</div>
                  <div className="mt-3 text-4xl font-semibold text-[#8ce0cf]">{formatScore(averageCommunity)}</div>
                  <div className="mt-2 text-sm text-white/55">来自本站真实评论和评分</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/12 bg-white/7 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs tracking-[0.3em] text-[#8ce0cf] uppercase">同步状态</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">数据监控</h2>
                </div>
                <Clock3 className="h-6 w-6 text-white/55" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-center gap-3 text-white/84">
                    <Sparkles className="h-5 w-5 text-[#f7b26a]" />
                    <span>豆瓣正在上映片单自动抓取</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    默认每 3 小时自动更新一次，同时页面访问时会做过期检查，尽量避免片单滞后。
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-center gap-3 text-white/84">
                    <MessageSquareMore className="h-5 w-5 text-[#8ce0cf]" />
                    <span>本站评论与社区均分独立计算</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/56">每条评论都可单独计分，不复用豆瓣用户打分逻辑。</p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-center gap-3 text-white/84">
                    <Star className="h-5 w-5 text-[#ffd19a]" />
                    <span>最近一次同步</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    {latestSync
                      ? `${formatRelativeTime(latestSync.finishedAt)} · ${formatAbsoluteDate(latestSync.finishedAt)}`
                      : "首次打开时会自动触发同步"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {featured ? (
          <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/12 bg-white/6 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="text-xs tracking-[0.3em] text-[#f8c18b] uppercase">本周焦点</div>
              <h2 className="mt-3 text-3xl font-semibold text-white">{featured.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                这部片当前排在映场首页第一位，优先按本站真实评论热度与社区分数展示；如果评论还不够多，则用豆瓣参考分作为兜底排序。
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/72">
                <span className="rounded-full border border-white/12 bg-black/20 px-4 py-2">{featured.releaseYear || "年份待定"}</span>
                <span className="rounded-full border border-white/12 bg-black/20 px-4 py-2">{featured.region || "地区待定"}</span>
                <span className="rounded-full border border-white/12 bg-black/20 px-4 py-2">{featured.duration || "时长待定"}</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                  <div className="text-xs tracking-[0.25em] text-white/45 uppercase">豆瓣分数</div>
                  <div className="mt-2 text-3xl font-semibold text-[#ffd19a]">{formatScore(featured.doubanScore)}</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                  <div className="text-xs tracking-[0.25em] text-white/45 uppercase">社区评分</div>
                  <div className="mt-2 text-3xl font-semibold text-[#8ce0cf]">{formatScore(featured.communityScore)}</div>
                </div>
              </div>
              <Link
                href={`/movie/${featured.id}`}
                className="mt-6 inline-flex rounded-full bg-[#f7b26a] px-5 py-3 text-sm font-semibold text-[#24150f] transition hover:brightness-105"
              >
                去看详情和评论
              </Link>
            </div>

            <Link
              href={`/movie/${featured.id}`}
              className="group relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/6 shadow-[0_24px_90px_rgba(0,0,0,0.18)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,178,106,0.12),transparent_30%)]" />
              <div className="relative aspect-[16/10]">
                <Image
                  src={featured.posterUrl}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0606] via-[#0d060620] to-transparent" />
              </div>
            </Link>
          </section>
        ) : null}

        <section id="movies" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs tracking-[0.3em] text-[#8ce0cf] uppercase">Now Showing</div>
              <h2 className="mt-2 text-3xl font-semibold text-white">正在上映片单</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/62">
                当前展示的是豆瓣 {latestSync?.cityName || "北京"} 页面中的正在上映电影，并额外叠加本站用户的社区口碑数据。
              </p>
            </div>
            <div className="text-sm text-white/50">
              最近同步：{latestSync ? formatAbsoluteDate(latestSync.finishedAt) : "等待首次同步"}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {communityHighlights.length > 0 ? (
            communityHighlights.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="rounded-[2rem] border border-white/12 bg-white/6 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.18)] backdrop-blur transition hover:border-[#8ce0cf]/38 hover:bg-white/10"
              >
                <div className="text-xs tracking-[0.3em] text-[#8ce0cf] uppercase">口碑抬头</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">{movie.title}</h3>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                    <div className="text-xs tracking-[0.25em] text-white/45 uppercase">社区评分</div>
                    <div className="mt-2 text-3xl font-semibold text-[#8ce0cf]">{formatScore(movie.communityScore)}</div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                    <div className="text-xs tracking-[0.25em] text-white/45 uppercase">评论数</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{movie.reviewCount}</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/5 p-8 text-center text-white/58 lg:col-span-3">
              第一批评论还没出现。你可以点进任意电影页，成为第一位留下评分的人。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
