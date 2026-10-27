import { NextRequest, NextResponse } from "next/server";
import { createAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "user").toString().slice(0, 32);
    const { account, apiKey } = await createAccount(name);
    return NextResponse.json({
      id: account.id,
      name: account.name,
      apiKey,
      warning: "Save this API key. If you lose it, you lose access to your scripts.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "signup failed" }, { status: 500 });
  }
}
