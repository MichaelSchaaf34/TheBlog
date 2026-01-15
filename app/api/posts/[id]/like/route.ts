import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const postId = ctx.params.id;
  const anonKey = req.headers.get("x-anon-key");

  if (!anonKey) {
    return new NextResponse("Missing x-anon-key", { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`like:${ip}`, 30, 60_000);
  if (!rl.ok) return new NextResponse("Too many requests", { status: 429 });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) return new NextResponse("Not found", { status: 404 });

  const existing = await prisma.like.findFirst({
    where: { postId, anonKey },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, anonKey } });
  }

  const likeCount = await prisma.like.count({ where: { postId } });

  return NextResponse.json({
    postId,
    liked: !existing,
    likeCount,
  });
}
