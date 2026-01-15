import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const postId = ctx.params.id;
  const likeCount = await prisma.like.count({ where: { postId } });

  return NextResponse.json({ postId, likeCount });
}
