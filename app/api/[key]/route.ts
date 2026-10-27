import { NextRequest, NextResponse } from "next/server";
import { getByIdOrPath, recoverLoader, fetchLoaderByPasteId } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };

  let record = getByIdOrPath(key);
  let body: string | null = null;

  if (record) {
    body = await recoverLoader(record);
  }

  if (!body && /^[A-Za-z0-9]{6,12}$/.test(key)) {
    body = await fetchLoaderByPasteId(key);
  }

  if (!body) {
    return new NextResponse(
      `-- EmorceHub: script not found\nerror("EmorceHub: invalid or deleted script")`,
      { status: 404, headers }
    );
  }

  return new NextResponse(body, { status: 200, headers });
}
