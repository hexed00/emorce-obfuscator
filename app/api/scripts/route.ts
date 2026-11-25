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

function buildOfflineBootstrap(host: string, key: string, token: string): string {
  const execUrl = `https://${host}/api/${key}/exec?t=${token}`;
  return `-- Emorce Hub · Bootstrap · IRVM payload
-- emorce native-stage handoff

local G = (type(getgenv) == "function" and getgenv()) or _G
if type(G.__EmorceBootstrapStop) == "function" then pcall(G.__EmorceBootstrapStop) end

local url = G.EmorcePayloadUrl or "${execUrl}"

local function httpget(u)
	local body
	local ok = pcall(function()
		if type(syn) == "table" and type(syn.request) == "function" then
			local r = syn.request({Url = u, Method = "GET"})
			body = r and r.Body
		elseif type(http_request) == "function" then
			local r = http_request({Url = u, Method = "GET"})
			body = r and r.Body
		elseif type(request) == "function" then
			local r = request({Url = u, Method = "GET"})
			body = r and r.Body
		elseif game and type(game.HttpGet) == "function" then
			body = game:HttpGet(u)
		else
			error("no HTTP")
		end
	end)
	if not ok or type(body) ~= "string" or #body < 10 then return nil end
	return body
end

local body = httpget(url)
if not body then
	error("EmorceHub: payload fail", 0)
end
if string.find(body, "need key", 1, true) then
	error("EmorceHub: need key", 0)
end

local L = loadstring or load
if type(L) ~= "function" then
	error("EmorceHub: no loadstring", 0)
end
local fn, cerr = L(body)
if type(fn) ~= "function" then
	error("EmorceHub: compile · " .. tostring(cerr), 0)
end

local function run()
	local ok, res = pcall(fn)
	if not ok then error("EmorceHub: " .. tostring(res), 0) end
end
if task and type(task.defer) == "function" then
	task.defer(run)
else
	run()
end
`;
}

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

    const publicKey = record.pasteId || customPath || id;
    const host = req.headers.get("host") || "emorce-obfuscator.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const token = makeToken(publicKey);
    const apiUrl = `${protocol}://${host}/api/${publicKey}?t=${token}`;
    const loadstring = `loadstring(game:HttpGet("${apiUrl}"))()`;
    const offlineLoadstring = buildOfflineBootstrap(host, publicKey, token);

    return NextResponse.json({
      id,
      customPath,
      key: publicKey,
      apiUrl,
      loadstring,
      offlineLoadstring,
      pasteId: record.pasteId,
      chars: source.length,
      strength,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
