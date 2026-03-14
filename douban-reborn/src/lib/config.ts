const DEFAULT_CITY_SLUG = "beijing";
const DEFAULT_CITY_NAME = "北京";
const DEFAULT_SYNC_WINDOW_HOURS = 3;

export function getDoubanCity() {
  return {
    slug: process.env.DOUBAN_CITY_SLUG?.trim() || DEFAULT_CITY_SLUG,
    name: process.env.DOUBAN_CITY_NAME?.trim() || DEFAULT_CITY_NAME,
  };
}

export function getSyncStaleMs() {
  const hours = Number(process.env.SYNC_WINDOW_HOURS || DEFAULT_SYNC_WINDOW_HOURS);

  if (Number.isFinite(hours) && hours > 0) {
    return hours * 60 * 60 * 1000;
  }

  return DEFAULT_SYNC_WINDOW_HOURS * 60 * 60 * 1000;
}

export function getSyncSecret() {
  return process.env.SYNC_SECRET?.trim() || "";
}

export function getCronSecret() {
  return process.env.CRON_SECRET?.trim() || "";
}
