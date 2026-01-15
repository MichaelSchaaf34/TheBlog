import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PostStatus } from "@prisma/client";

type CreatePostBody = {
  title: string;
  slug: string;
  contentMd: string;
  excerpt?: string;
  categorySlug: "tech" | "general";
  status?: "DRAFT" | "PUBLISHED" | "UNLISTED";
  tagSlugs?: string[];
};

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as CreatePostBody;

  if (!body.title || !body.slug || !body.contentMd || !body.categorySlug) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { slug: body.categorySlug },
    select: { id: true },
  });

  if (!category) {
    return new NextResponse("Unknown categorySlug", { status: 400 });
  }

  const status = (body.status as PostStatus) ?? PostStatus.DRAFT;
  const publishedAt = status === PostStatus.PUBLISHED ? new Date() : null;

  const created = await prisma.post.create({
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      contentMd: body.contentMd,
      status,
      publishedAt,
      categoryId: category.id,
      postTags: body.tagSlugs?.length
        ? {
            create: body.tagSlugs.map((slug) => ({
              tag: {
                connectOrCreate: {
                  where: { slug },
                  create: { slug, name: slug.replace(/-/g, " ") },
                },
              },
            })),
          }
        : undefined,
    },
    select: { id: true, slug: true, status: true },
  });

  return NextResponse.json(created, { status: 201 });
}
