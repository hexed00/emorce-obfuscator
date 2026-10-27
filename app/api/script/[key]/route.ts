import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getByIdOrPath, scripts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { password, action, source } = await req.json();
    const record = getByIdOrPath(params.key);

    if (!record) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    const ok = await bcrypt.compare(password || "", record.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    if (action === "update" && typeof source === "string") {
      record.source = source;
      record.updatedAt = Date.now();
      scripts.set(record.id, record);
      if (record.customPath) scripts.set(record.customPath, record);
      return NextResponse.json({ ok: true, chars: source.length });
    }

    if (action === "delete") {
      scripts.delete(record.id);
      if (record.customPath) scripts.delete(record.customPath);
      return NextResponse.json({ ok: true, deleted: true });
    }

    return NextResponse.json({
      ok: true,
      id: record.id,
      customPath: record.customPath,
      source: record.source,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      chars: record.source.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 500 });
  }
}
