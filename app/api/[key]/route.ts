import { NextRequest, NextResponse } from "next/server";
import {
  getByIdOrPath,
  recoverLoader,
  fetchLoaderByPasteId,
} from "@/lib/store";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const DENY_BODY = `-- EmorceHub\nerror("EmorceHub: need key")`;

function isRobloxClient(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  if (ua.includes("roblox")) return true;
  if (ua.includes("wininet")) return true;
  if (ua.includes("synapse") || ua.includes("script-ware") || ua.includes("electron"))
    return true;
  return false;
}

function wantsJson(req: NextRequest): boolean {
  const accept = (req.headers.get("accept") || "").toLowerCase();
  return accept.includes("application/json");
}

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };

  const headerKey =
    req.headers.get("x-emorce-key") ||
    req.headers.get("x-api-key") ||
    req.nextUrl.searchParams.get("key") ||
    "";

  const allowRoblox = isRobloxClient(req);
  let allowByPassword = false;

  const record = getByIdOrPath(key);

  if (headerKey && record?.passwordHash) {
    try {
      allowByPassword = await bcrypt.compare(headerKey, record.passwordHash);
    } catch {
      allowByPassword = false;
    }
  }

  if (!allowRoblox && !allowByPassword) {
    if (wantsJson(req)) {
      return NextResponse.json(
        { error: "need key", message: "EmorceHub: need key" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    return new NextResponse(DENY_BODY, { status: 401, headers });
  }

  let body: string | null = null;
  if (record) {
    body = await recoverLoader(record);
  }
  if (!body && /^[A-Za-z0-9]{6,12}$/.test(key)) {
    if (allowRoblox || allowByPassword) {
      body = await fetchLoaderByPasteId(key);
    }
  }

  if (!body) {
    return new NextResponse(
      `-- EmorceHub\nerror("EmorceHub: invalid or deleted script")`,
      { status: 404, headers }
    );
  }

  return new NextResponse(body, { status: 200, headers });
}
