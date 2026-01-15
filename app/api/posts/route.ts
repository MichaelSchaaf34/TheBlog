import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";

function parseStatus(status: string | null): PostStatus | null {
  if (!status) return null;
  const upper = status.toUpperCase();

  if (upper === "PUBLISHED") return PostStatus.PUBLISHED;
  if (upper === "UNLISTED") return PostStatus.UNLISTED;
  if (upper === "DRAFT") return PostStatus.DRAFT;

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const status = parseStatus(searchParams.get("status")) ?? PostStatus.PUBLISHED;

  const posts = await prisma.post.findMany({
    where: {
      status,
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { contentMd: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { slug: true, name: true } },
      _count: { select: { likes: true } },
      postTags: { select: { tag: { select: { slug: true, name: true } } } },
    },
    take: 50,
  });

  return NextResponse.json(posts);
}
