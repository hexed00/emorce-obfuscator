import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Full ~95s track @ 192kbps (luvkrime / cocaine cut)
const FULL_MUSIC_URL = "https://n.uguu.se/PNWsZtOciVSK.mp3";

export async function GET() {
  try {
    for (const name of ["emorce-music-full.mp3", "site-music.mp3"]) {
      try {
        const local = path.join(process.cwd(), "public", name);
        const buf = await readFile(local);
        if (buf.length > 1_000_000) {
          return new NextResponse(buf, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
              "Content-Length": String(buf.length),
              "Accept-Ranges": "bytes",
            },
          });
        }
      } catch {
        // try next
      }
    }

    const res = await fetch(FULL_MUSIC_URL, { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse("music unavailable", { status: 502 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(buf.length),
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return new NextResponse("music error", { status: 500 });
  }
}
