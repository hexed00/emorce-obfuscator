import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getByIdOrPath, saveRecord } from "@/lib/store";
import {
  lightProtect,
  buildEncodedLoader,
  buildHardenedLoader,
} from "@/lib/obfuscate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source: string = (body.source || "").trim();
    const password: string = (body.password || "").trim();
    let customPath: string | null = (body.customPath || "").trim() || null;
    const strength: "light" | "encoded" | "hardened" =
      body.strength === "light" || body.strength === "hardened"
        ? body.strength
        : "encoded";

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
    } else {
      loader = buildEncodedLoader(source, id);
    }

    const record = {
      id,
      customPath,
      passwordHash,
      source,
      loader,
      strength,
      createdAt: now,
      updatedAt: now,
    };
    saveRecord(record);

    const key = customPath || id;
    const host = req.headers.get("host") || "emorce-obfuscator.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const apiUrl = `${protocol}://${host}/api/${key}`;
    const loadstring = `loadstring(game:HttpGet("${apiUrl}"))()`;

    return NextResponse.json({
      id,
      customPath,
      key,
      apiUrl,
      loadstring,
      chars: source.length,
      strength,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
