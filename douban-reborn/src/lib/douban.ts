import { load } from "cheerio";

import { getDoubanCity } from "@/lib/config";
import type { SyncPayload } from "@/lib/types";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  Referer: "https://movie.douban.com/",
};

function cleanText(value: string | undefined | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function toNumber(value: string | undefined | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function fetchNowPlayingMoviesFromDouban() {
  const city = getDoubanCity();
  const url = `https://movie.douban.com/cinema/nowplaying/${city.slug}/`;
  const response = await fetch(url, {
    headers: HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`豆瓣页面抓取失败，状态码 ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);
  const items: SyncPayload[] = [];

  $("#nowplaying .list-item").each((_, element) => {
    const item = $(element);
    const id = cleanText(item.attr("data-subject"));
    const title = cleanText(item.attr("data-title")) || cleanText(item.find(".stitle a").text());
    const posterUrl = cleanText(item.find("img").attr("src"));
    const doubanUrl = cleanText(item.find(".stitle a").attr("href")).split("?")[0];

    if (!id || !title || !posterUrl || !doubanUrl) {
      return;
    }

    items.push({
      id,
      title,
      posterUrl,
      doubanScore: toNumber(item.attr("data-score")),
      doubanVoteCount: Number(item.attr("data-votecount") || 0),
      doubanUrl,
      releaseYear: cleanText(item.attr("data-release")),
      duration: cleanText(item.attr("data-duration")),
      region: cleanText(item.attr("data-region")),
      director: cleanText(item.attr("data-director")),
      actors: cleanText(item.attr("data-actors")),
    });
  });

  const deduped = items.filter(
    (movie, index, source) => source.findIndex((candidate) => candidate.id === movie.id) === index,
  );

  if (deduped.length === 0) {
    throw new Error("抓取结果为空，豆瓣页面结构可能发生了变化");
  }

  return {
    city,
    movies: deduped,
  };
}
