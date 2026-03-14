const scoreFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const compactFormatter = new Intl.NumberFormat("zh-CN");

export function formatScore(score: number | null) {
  return score === null ? "暂无" : scoreFormatter.format(score);
}

export function formatVotes(votes: number) {
  return compactFormatter.format(votes);
}

export function formatRelativeTime(value: string) {
  const target = new Date(value).getTime();
  const delta = target - Date.now();
  const minutes = Math.round(delta / (1000 * 60));
  const hours = Math.round(delta / (1000 * 60 * 60));
  const days = Math.round(delta / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  return formatter.format(days, "day");
}

export function formatAbsoluteDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
