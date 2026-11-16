import { NextRequest, NextResponse } from "next/server";
import { getByIdOrPath } from "@/lib/store";
import { checkToken } from "@/lib/token";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const WEBHOOK =
  "https://discord.com/api/webhooks/1571926938224693454/6Azsupurb9hAD6S-tD3OmN_RpvJ3UtspQ8gU7f-_6yb_UH-DJQJ60xMYIYts3-ZsJ5lX";

async function fireWebhook(payload: Record<string, unknown>) {
  try {
    await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: null,
        embeds: [
          {
            title: "EmorceHub · Script View",
            color: 0xc41e3a,
            fields: Object.entries(payload).map(([name, value]) => ({
              name,
              value: String(value).slice(0, 1024),
              inline: true,
            })),
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch {
    /* ignore */
  }
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "").trim();
  const t = String(body.t || req.nextUrl.searchParams.get("t") || "");
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") || "";

  if (!password) {
    return NextResponse.json({ error: "need key" }, { status: 401 });
  }

  const tokenOk = t ? checkToken(key, t) : true;
  const record = getByIdOrPath(key);
  let allow = false;
  let source: string | null = null;

  if (record?.passwordHash) {
    try {
      allow = await bcrypt.compare(password, record.passwordHash);
    } catch {
      allow = false;
    }
    if (allow) source = record.source || null;
  }

  if (!record) {
    await fireWebhook({ status: "FAIL · no record", key, ip, ua: ua.slice(0, 120) });
    return NextResponse.json({ error: "invalid or deleted script" }, { status: 404 });
  }

  if (!allow || !tokenOk) {
    await fireWebhook({ status: "FAIL · bad key", key, ip, ua: ua.slice(0, 120) });
    return NextResponse.json({ error: "need key" }, { status: 401 });
  }

  if (!source) {
    return NextResponse.json(
      { error: "source not available (re-protect while logged in)" },
      { status: 404 }
    );
  }

  await fireWebhook({
    status: "UNLOCKED",
    key,
    ip,
    strength: record.strength,
    chars: source.length,
    ua: ua.slice(0, 80),
  });

  return NextResponse.json({ source, key, chars: source.length });
}
