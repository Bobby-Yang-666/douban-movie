import Image from "next/image";
import Link from "next/link";

import { formatScore, formatVotes } from "@/lib/format";
import type { MovieSummary } from "@/lib/types";

type MovieCardProps = {
  movie: MovieSummary;
};

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group overflow-hidden rounded-[2rem] border border-white/12 bg-white/6 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#f8a24f]/55 hover:bg-white/10"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0505] via-[#0c050540] to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-[#100908]/75 px-3 py-1 text-xs tracking-[0.3em] text-[#f8e4cf] uppercase">
          正在上映
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-xl font-semibold text-white">{movie.title}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-white/68">
            {movie.releaseYear || "年份待补充"} · {movie.region || "地区待补充"} · {movie.duration || "时长待补充"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs tracking-[0.25em] text-white/45 uppercase">豆瓣分数</div>
            <div className="mt-2 text-2xl font-semibold text-[#ffd19a]">{formatScore(movie.doubanScore)}</div>
            <div className="mt-1 text-xs text-white/55">{formatVotes(movie.doubanVoteCount)} 人参考</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs tracking-[0.25em] text-white/45 uppercase">社区评分</div>
            <div className="mt-2 text-2xl font-semibold text-[#8ce0cf]">{formatScore(movie.communityScore)}</div>
            <div className="mt-1 text-xs text-white/55">{movie.reviewCount} 条评论</div>
          </div>
        </div>

        <div className="line-clamp-2 text-sm leading-6 text-white/70">
          导演：{movie.director || "待同步"} | 演员：{movie.actors || "待同步"}
        </div>
      </div>
    </Link>
  );
}
