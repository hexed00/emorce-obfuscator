import { NextRequest, NextResponse } from "next/server";
import {
  getByIdOrPath,
  recoverLoader,
  fetchLoaderByPasteId,
} from "@/lib/store";
import { checkToken, makeToken } from "@/lib/token";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const DENY = `-- EmorceHub
error("EmorceHub: need key")`;

function isRoblox(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  if (ua.includes("roblox")) return true;
  if (ua.includes("wininet")) return true;
  if (ua.includes("synapse") || ua.includes("script-ware") || ua.includes("electron"))
    return true;
  if (!ua || ua === "http") return true;
  return false;
}

function isBrowser(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const accept = (req.headers.get("accept") || "").toLowerCase();
  const dest = (req.headers.get("sec-fetch-dest") || "").toLowerCase();
  const mode = (req.headers.get("sec-fetch-mode") || "").toLowerCase();
  if (dest === "document" || dest === "iframe") return true;
  if (mode === "navigate") return true;
  if (accept.includes("text/html")) return true;
  if (
    ua.includes("mozilla") ||
    ua.includes("chrome") ||
    ua.includes("safari") ||
    ua.includes("firefox")
  )
    return true;
  return false;
}

function buildBootstrap(host: string, key: string, token: string): string {
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
	if not ok then
		error("EmorceHub: " .. tostring(res), 0)
	end
end

if task and type(task.defer) == "function" then
	task.defer(run)
else
	run()
end
`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const token = req.nextUrl.searchParams.get("t");
  const host = req.headers.get("host") || "emorce-obfuscator.vercel.app";

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };

  if (isBrowser(req) && !isRoblox(req)) {
    const t = token || makeToken(key);
    const url = new URL(`https://${host}/view/${encodeURIComponent(key)}`);
    url.searchParams.set("t", t);
    return NextResponse.redirect(url.toString(), 302);
  }

  const pw =
    req.headers.get("x-emorce-key") ||
    req.headers.get("x-api-key") ||
    req.nextUrl.searchParams.get("key") ||
    "";
  const record = getByIdOrPath(key);
  let allowPw = false;
  if (pw && record?.passwordHash) {
    try {
      allowPw = await bcrypt.compare(pw, record.passwordHash);
    } catch {
      allowPw = false;
    }
  }

  const tokenOk = checkToken(key, token);
  if (!tokenOk && !allowPw) {
    return new NextResponse(DENY, { status: 401, headers });
  }

  if (allowPw) {
    let body: string | null = null;
    if (record) body = await recoverLoader(record);
    if (!body) body = await fetchLoaderByPasteId(key);
    if (!body) return new NextResponse(DENY, { status: 404, headers });
    return new NextResponse(body, { status: 200, headers });
  }

  const bootstrap = buildBootstrap(host, key, token || makeToken(key));
  return new NextResponse(bootstrap, { status: 200, headers });
}
