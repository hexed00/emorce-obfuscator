import { NextRequest, NextResponse } from "next/server";
import { getByIdOrPath } from "@/lib/store";
import { lightProtect } from "@/lib/obfuscate";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const record = getByIdOrPath(key);

  if (!record) {
    return new NextResponse(
      `-- EmorceHub: script not found or deleted\nerror("EmorceHub: invalid or deleted script")`,
      {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const body = lightProtect(record.source, record.id);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Emorce-Protected": "1",
    },
  });
}
