import { NextRequest, NextResponse } from "next/server";
import {
  getByIdOrPath,
  recoverLoader,
  fetchLoaderByPasteId,
} from "@/lib/store";
import { checkToken } from "@/lib/token";

export const dynamic = "force-dynamic";

const DENY = `-- EmorceHub\nerror("EmorceHub: need key")`;

function isSuspicious(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const ref = (req.headers.get("referer") || "").toLowerCase();
  const accept = (req.headers.get("accept") || "").toLowerCase();
  const dest = (req.headers.get("sec-fetch-dest") || "").toLowerCase();

  if (ua.includes("discord")) return true;
  if (ref.includes("discord")) return true;
  if (ua.includes("mozilla") && accept.includes("text/html")) return true;
  if (dest === "document") return true;
  if (ua.includes("python") || ua.includes("axios") || ua.includes("node"))
    return true;
  if (ua.includes("leakd") || ua.includes("curl") || ua.includes("wget"))
    return true;
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const token = req.nextUrl.searchParams.get("t");
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  };

  if (!checkToken(key, token)) {
    return new NextResponse(DENY, { status: 401, headers });
  }

  if (isSuspicious(req)) {
    return new NextResponse(DENY, { status: 401, headers });
  }

  const record = getByIdOrPath(key);
  let body: string | null = null;
  if (record) body = await recoverLoader(record);
  if (!body) body = await fetchLoaderByPasteId(key);

  if (!body) {
    return new NextResponse(DENY, { status: 404, headers });
  }

  return new NextResponse(body, { status: 200, headers });
}
