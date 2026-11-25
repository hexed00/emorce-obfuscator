import { NextResponse } from "next/server";
import { EMORCE_MUSIC_B64 } from "@/lib/music-b64";

export const dynamic = "force-static";

export async function GET() {
  const buf = Buffer.from(EMORCE_MUSIC_B64, "base64");
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buf.length),
    },
  });
}
