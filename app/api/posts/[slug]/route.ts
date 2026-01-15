import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";

export async function GET(_: NextRequest, ctx: { params: { slug: string } }) {
  const { slug } = ctx.params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      contentMd: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      category: { select: { slug: true, name: true } },
      _count: { select: { likes: true } },
      postTags: { select: { tag: { select: { slug: true, name: true } } } },
    },
  });

  if (!post) return new NextResponse("Not found", { status: 404 });

  if (post.status === PostStatus.DRAFT) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(post);
}
