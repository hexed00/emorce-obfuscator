import { NextRequest, NextResponse } from "next/server";
import {
  getByIdOrPath,
  recoverLoader,
  fetchLoaderByPasteId,
} from "@/lib/store";
import { checkToken } from "@/lib/token";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const DENY = `-- EmorceHub\nerror("EmorceHub: need key")`;

function isSuspicious(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const ref = (req.headers.get("referer") || "").toLowerCase();
  const accept = (req.headers.get("accept") || "").toLowerCase();
  const dest = (req.headers.get("sec-fetch-dest") || "").toLowerCase();
  const mode = (req.headers.get("sec-fetch-mode") || "").toLowerCase();

  if (ua.includes("discord")) return true;
  if (ref.includes("discord")) return true;
  if (ua.includes("mozilla") && accept.includes("text/html")) return true;
  if (dest === "document" || dest === "iframe") return true;
  if (mode === "navigate") return true;
  if (ua.includes("python") || ua.includes("axios") || ua.includes("node-fetch"))
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
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };

  const pw =
    req.headers.get("x-emorce-key") ||
    req.headers.get("x-api-key") ||
    req.nextUrl.searchParams.get("key") ||
    "";
  const record = getByIdOrPath(key);
  let allowPw = false;
  if (pw && record?.passwordHash) {
    try {
      allowPw = await bcrypt.compare(pw, record.passwordHash);
    } catch {
      allowPw = false;
    }
  }

  const tokenOk = checkToken(key, token);

  if (!tokenOk && !allowPw) {
    return new NextResponse(DENY, { status: 401, headers });
  }

  if (isSuspicious(req) && !allowPw) {
    return new NextResponse(DENY, { status: 401, headers });
  }

  let body: string | null = null;
  if (record) body = await recoverLoader(record);
  if (!body && /^[A-Za-z0-9]{6,12}$/.test(key)) {
    body = await fetchLoaderByPasteId(key);
  }

  if (!body) {
    return new NextResponse(
      `-- EmorceHub\nerror("EmorceHub: invalid or deleted script")`,
      { status: 404, headers }
    );
  }

  return new NextResponse(body, { status: 200, headers });
}
