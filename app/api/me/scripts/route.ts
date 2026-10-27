import { NextRequest, NextResponse } from "next/server";
import { findAccountByApiKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey =
    req.headers.get("x-emorce-key") ||
    req.nextUrl.searchParams.get("key") ||
    "";
  if (!apiKey.startsWith("emorce_")) {
    return NextResponse.json({ error: "need api key" }, { status: 401 });
  }
  const acc = await findAccountByApiKey(apiKey);
  if (!acc) {
    return NextResponse.json({ name: null, scripts: [], cold: true });
  }
  return NextResponse.json({
    name: acc.name,
    scripts: acc.scripts || [],
  });
}
