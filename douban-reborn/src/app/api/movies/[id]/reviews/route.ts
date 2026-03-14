import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createReview } from "@/lib/movies";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const payload = (await request.json()) as {
      nickname?: unknown;
      rating?: unknown;
      content?: unknown;
    };

    await createReview(id, {
      nickname: String(payload.nickname || ""),
      rating: Number(payload.rating),
      content: String(payload.content || ""),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message || "参数不合法",
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "评论提交失败",
      },
      { status: 500 },
    );
  }
}
