"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const SCORES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

type ReviewFormProps = {
  movieId: string;
};

export function ReviewForm({ movieId }: ReviewFormProps) {
  const router = useRouter();
  const [score, setScore] = useState(8);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch(`/api/movies/${movieId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname: String(formData.get("nickname") || ""),
        content: String(formData.get("content") || ""),
        rating: score,
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "评论提交失败，请稍后再试");
      return;
    }

    form.reset();
    setScore(8);
    setMessage("评论已发布，感谢你的评分。");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/12 bg-white/7 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.18)] backdrop-blur"
    >
      <div className="mb-6">
        <div className="text-xs tracking-[0.3em] text-[#f8c18b] uppercase">写下你的看法</div>
        <h3 className="mt-3 text-2xl font-semibold text-white">给这部电影打个分</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">采用 1 到 10 分制，支持匿名昵称，提交后会即时计入社区均分。</p>
      </div>

      <label className="mb-5 block">
        <span className="mb-2 block text-sm text-white/76">昵称</span>
        <input
          name="nickname"
          maxLength={24}
          placeholder="比如：影迷小北"
          className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-[#f7b26a]"
        />
      </label>

      <div className="mb-5">
        <div className="mb-2 text-sm text-white/76">评分</div>
        <div className="grid grid-cols-5 gap-2">
          {SCORES.map((value) => {
            const selected = value === score;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setScore(value)}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? "border-[#f7b26a] bg-[#f7b26a] text-[#22120e]"
                    : "border-white/12 bg-black/20 text-white/75 hover:border-white/28 hover:text-white"
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      <label className="mb-5 block">
        <span className="mb-2 block text-sm text-white/76">评论</span>
        <textarea
          name="content"
          rows={6}
          maxLength={280}
          placeholder="这部片最打动你的是什么？"
          className="w-full rounded-[1.5rem] border border-white/12 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-[#8ce0cf]"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#f7b26a] px-5 py-3 font-semibold text-[#24150f] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "提交中..." : "发布评论"}
      </button>

      {message ? <p className="mt-4 text-sm text-[#8ce0cf]">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-[#ffb1a4]">{error}</p> : null}
    </form>
  );
}
