import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getByIdOrPath, saveRecord, deleteRecord } from "@/lib/store";
import {
  lightProtect,
  buildEncodedLoader,
  buildHardenedLoader,
} from "@/lib/obfuscate";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { password, action, source, strength } = await req.json();
    const record = getByIdOrPath(params.key);

    if (!record) {
      return NextResponse.json(
        { error: "Script not found (cold start — re-protect on the site)" },
        { status: 404 }
      );
    }

    const ok = await bcrypt.compare(password || "", record.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    if (action === "update" && typeof source === "string") {
      const s =
        strength === "light" || strength === "hardened" || strength === "encoded"
          ? strength
          : record.strength;
      let loader: string;
      if (s === "light") loader = lightProtect(source, record.id);
      else if (s === "hardened") loader = buildHardenedLoader(source, record.id);
      else loader = buildEncodedLoader(source, record.id);

      record.source = source;
      record.loader = loader;
      record.strength = s;
      record.updatedAt = Date.now();
      saveRecord(record);
      return NextResponse.json({ ok: true, chars: source.length, strength: s });
    }

    if (action === "delete") {
      deleteRecord(record);
      return NextResponse.json({ ok: true, deleted: true });
    }

    return NextResponse.json({
      ok: true,
      id: record.id,
      customPath: record.customPath,
      source: record.source,
      strength: record.strength,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      chars: record.source.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 500 });
  }
}
