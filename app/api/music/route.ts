import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Hosted track mirror — always works without huge base64 modules on git
const MUSIC_URL = "https://d.uguu.se/auYykEDyMCiw.mp3";

export async function GET() {
  try {
    const res = await fetch(MUSIC_URL, { cache: "force-cache" });
    if (!res.ok) {
      return new NextResponse("music unavailable", { status: 502 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "Content-Length": String(buf.length),
      },
    });
  } catch {
    return new NextResponse("music error", { status: 500 });
  }
}
