import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getByIdOrPath, saveRecord, persistToPastefy } from "@/lib/store";
import {
  lightProtect,
  buildEncodedLoader,
  buildHardenedLoader,
  buildHoneyLoader,
  buildVoltLoader,
  buildHexedVmLoader,
  buildIrVmLoader,
} from "@/lib/obfuscate";
import { makeToken } from "@/lib/token";
import { addScriptToAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source: string = (body.source || "").trim();
    const password: string = (body.password || "").trim();
    let customPath: string | null = (body.customPath || "").trim() || null;
    const allowed = ["light","encoded","hardened","honey","volt","hexedvm","irvm"] as const;
    type Str = typeof allowed[number];
    const strength: Str = allowed.includes(body.strength) ? body.strength : "encoded";

    if (!source) {
      return NextResponse.json({ error: "Script source required" }, { status: 400 });
    }
    if (!password || password.length < 5 || password.length > 20) {
      return NextResponse.json(
        { error: "Password must be 5–20 characters" },
        { status: 400 }
      );
    }

    if (customPath) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customPath)) {
        return NextResponse.json(
          { error: "Custom path: 3–20 letters, numbers, - _ only" },
          { status: 400 }
        );
      }
      if (getByIdOrPath(customPath)) {
        return NextResponse.json(
          { error: "That custom path is already taken" },
          { status: 409 }
        );
      }
    }

    const id = nanoid(12);
    const passwordHash = await bcrypt.hash(password, 10);
    const now = Date.now();

    let loader: string;
    if (strength === "light") {
      loader = lightProtect(source, id);
    } else if (strength === "hardened") {
      loader = buildHardenedLoader(source, id);
    } else if (strength === "honey") {
      loader = buildHoneyLoader(source, id);
    } else if (strength === "volt") {
      loader = buildVoltLoader(source, id);
    } else if (strength === "hexedvm") {
      loader = buildHexedVmLoader(source, id);
    } else if (strength === "irvm") {
      loader = buildIrVmLoader(source, id);
    } else {
      loader = buildEncodedLoader(source, id);
    }

    let record = {
      id,
      customPath,
      passwordHash,
      source,
      loader,
      strength,
      pasteId: null as string | null,
      metaPasteId: null as string | null,
      createdAt: now,
      updatedAt: now,
    };

    record = await persistToPastefy(record);
    saveRecord(record);

    const apiKeyHeader =
      req.headers.get("x-emorce-key") ||
      (typeof body.apiKey === "string" ? body.apiKey : "") ||
      "";
    if (apiKeyHeader.startsWith("emorce_")) {
      await addScriptToAccount(apiKeyHeader, {
        id: record.id,
        key: record.pasteId || record.customPath || record.id,
        strength: record.strength,
        chars: source.length,
        createdAt: record.createdAt,
        customPath: record.customPath,
      });
    }

    const token = makeToken(record.id);
    const host = req.headers.get("host") || "emorce-obfuscator.vercel.app";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const base = `${proto}://${host}`;

    return NextResponse.json({
      ok: true,
      id: record.id,
      key: record.customPath || record.id,
      strength: record.strength,
      chars: source.length,
      loadstring: `loadstring(game:HttpGet("${base}/api/${record.customPath || record.id}"))()`,
      offline: record.loader,
      manage: `${base}/view/${record.id}?t=${token}`,
      pasteId: record.pasteId,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get("x-emorce-key") ||
      new URL(req.url).searchParams.get("key") ||
      "";
    if (!apiKey.startsWith("emorce_")) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }
    const { listScriptsForAccount } = await import("@/lib/auth");
    const scripts = await listScriptsForAccount(apiKey);
    return NextResponse.json({ scripts });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
