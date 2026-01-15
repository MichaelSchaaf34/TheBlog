import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  const ok =
    token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;

  if (!ok) {
    return {
      ok: false as const,
      response: new Response("Unauthorized", { status: 401 }),
    };
  }

  return { ok: true as const };
}
