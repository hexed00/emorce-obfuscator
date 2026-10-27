import { NextRequest, NextResponse } from "next/server";
import { loginWithApiKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = (body.apiKey || "").toString().trim();
    if (!apiKey.startsWith("emorce_")) {
      return NextResponse.json({ error: "invalid api key" }, { status: 401 });
    }
    const account = await loginWithApiKey(apiKey);
    if (!account) {
      return NextResponse.json({ error: "invalid api key" }, { status: 401 });
    }
    return NextResponse.json({
      id: account.id,
      name: account.name,
      scriptCount: (account.scripts || []).length,
      webhookUrl: account.webhookUrl || null,
      ipLog: !!account.ipLog,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "login failed" }, { status: 500 });
  }
}
