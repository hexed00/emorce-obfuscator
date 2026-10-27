import { NextRequest, NextResponse } from "next/server";
import { getByIdOrPath } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const record = getByIdOrPath(key);

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };

  if (!record) {
    return new NextResponse(
      `-- EmorceHub: script not found (cold start or deleted)\n` +
        `-- Re-protect the script on the site to regenerate the loadstring.\n` +
        `error("EmorceHub: invalid or deleted script")`,
      { status: 404, headers }
    );
  }

  const body = record.loader || record.source;

  return new NextResponse(body, {
    status: 200,
    headers,
  });
}
