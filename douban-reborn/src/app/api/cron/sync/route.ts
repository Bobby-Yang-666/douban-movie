import { NextResponse } from "next/server";

import { getCronSecret, getSyncSecret } from "@/lib/config";
import { syncNowPlayingMovies } from "@/lib/movies";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const cronSecret = getCronSecret();
  const syncSecret = getSyncSecret();
  const expected = cronSecret || syncSecret;

  if (!expected) {
    return false;
  }

  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  return bearer === expected;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const result = await syncNowPlayingMovies();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "同步失败",
      },
      { status: 500 },
    );
  }
}
