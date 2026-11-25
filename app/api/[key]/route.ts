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
  return `-- language: Luau | target: Roblox executor
-- Emorce Hub · Bootstrap · native-stage handoff · IRVM payload
-- emorce obf: exact approved bootstrap, one native scheduler handoff.

if type(_G.__EmorceBootstrapStop) == "function" then
	pcall(_G.__EmorceBootstrapStop)
end
if type(_G.EmorceUIStop) == "function" then
	pcall(_G.EmorceUIStop)
end

local 環境 = (type(getgenv) == "function" and getgenv()) or _G
local 診断 = {
	version = 1,
	profile = "emorce-native-compile-boundary-v1",
	stage = "entry",
	hub = "Emorce",
	startedAt = os.clock(),
}
local 段階数 = 0

local function _EmNativeStage(stage)
	診断.stage = stage
	診断.updatedAt = os.clock()
	環境.EmorceBootstrapDiagnostic = 診断
	if 段階数 < 16 and task and type(task.wait) == "function" then
		段階数 = 段階数 + 1
		task.wait()
	end
end

_EmNativeStage("common-cold-start")

local 設定 = {
	payloadUrl = 環境.EmorcePayloadUrl or "${execUrl}",
	pinnedUrl = 環境.EmorcePinnedUrl or nil,
	cacheFolder = "EmorceHub",
	cacheFile = "EmorceHub/bootstrap_payload.lua",
	preferCache = false,
	compileLabel = "Emorce Hub module",
	discord = "https://discord.gg/zSkE4yWHGj",
	title = "Emorce Hub",
}

do
	local 供給 = (type(環境.EmorceBootstrap) == "table" and 環境.EmorceBootstrap) or {}
	for k, v in pairs(供給) do
		設定[k] = v
	end
	if not 設定.payloadUrl or #tostring(設定.payloadUrl) < 8 then
		設定.payloadUrl = "${execUrl}"
	end
end

local function 取得(url)
	local 応答本体
	local 成功, 失敗理由 = pcall(function()
		local 要求表 = { Url = url, Method = "GET", Headers = {} }
		if type(syn) == "table" and type(syn.request) == "function" then
			local r = syn.request(要求表)
			応答本体 = r and r.Body
		elseif type(http_request) == "function" then
			local r = http_request(要求表)
			応答本体 = r and r.Body
		elseif type(request) == "function" then
			local r = request(要求表)
			応答本体 = r and r.Body
		elseif type(game.HttpGet) == "function" then
			応答本体 = game:HttpGet(url)
		else
			error("no HTTP surface")
		end
	end)
	if not 成功 then
		return nil, tostring(失敗理由)
	end
	if type(応答本体) ~= "string" or #応答本体 < 8 then
		return nil, "empty or short body"
	end
	return 応答本体
end

local function キャッシュ読込()
	if not 設定.preferCache then return nil end
	if type(readfile) ~= "function" then return nil end
	local 成功, 生 = pcall(function()
		if type(isfile) == "function" and not isfile(設定.cacheFile) then return nil end
		return readfile(設定.cacheFile)
	end)
	if 成功 and type(生) == "string" and #生 > 8 then return 生 end
	return nil
end

local function キャッシュ書込(ソース)
	if type(writefile) ~= "function" or type(ソース) ~= "string" then return end
	pcall(function()
		if type(makefolder) == "function" and type(isfolder) == "function" then
			if not isfolder(設定.cacheFolder) then pcall(makefolder, 設定.cacheFolder) end
		end
		writefile(設定.cacheFile, ソース)
	end)
end

local 展開 = table.unpack or unpack
local function 梱包(...)
	return { n = select("#", ...), ... }
end

local function 境界(fn, label)
	return function(...)
		_EmNativeStage(label)
		local out = 梱包(fn(...))
		_EmNativeStage(label .. "-ready")
		return 展開(out, 1, out.n)
	end
end

local 基本コンパイル = loadstring or load
local function コンパイル(bytes, label)
	local kind = (label == 設定.compileLabel) and "game" or "common"
	_EmNativeStage("compile-" .. kind)
	local fn, err = 基本コンパイル(bytes, label or "Emorce")
	_EmNativeStage("compiled-" .. kind)
	if type(fn) == "function" then
		fn = 境界(fn, "evaluate-" .. kind)
	end
	return fn, err
end

local function ソース解決()
	_EmNativeStage("resolve-start")
	local sources = {}
	if type(設定.pinnedUrl) == "string" and #設定.pinnedUrl > 8 then
		table.insert(sources, { tag = "pinned", url = 設定.pinnedUrl })
	end
	if type(設定.payloadUrl) == "string" and #設定.payloadUrl > 8 then
		table.insert(sources, { tag = "live", url = 設定.payloadUrl })
	end
	for _, entry in ipairs(sources) do
		_EmNativeStage("fetch-" .. entry.tag)
		local body, err = 取得(entry.url)
		if body then
			if body:find("need key", 1, true) then
				診断.fetchDenied = entry.tag
			else
				診断.lastSource = entry.tag
				診断.lastUrl = entry.url
				診断.bytes = #body
				キャッシュ書込(body)
				_EmNativeStage("fetch-" .. entry.tag .. "-ok")
				return body, entry.tag
			end
		else
			診断["fetchErr_" .. entry.tag] = err
		end
	end
	local cached = キャッシュ読込()
	if cached then
		診断.lastSource = "cache"
		診断.bytes = #cached
		_EmNativeStage("fetch-cache-ok")
		return cached, "cache"
	end
	_EmNativeStage("resolve-fail")
	return nil, "all sources failed"
end

local function ランタイム開始(source, sourceTag)
	_EmNativeStage("runtime-start")
	local fn, err = コンパイル(source, 設定.compileLabel)
	if type(fn) ~= "function" then
		診断.compileError = tostring(err or "compile returned non-function")
		_EmNativeStage("runtime-compile-fail")
		error("EmorceHub: " .. tostring(診断.compileError), 0)
	end
	_EmNativeStage("runtime-invoke")
	local ok, result = pcall(fn)
	if not ok then
		診断.runtimeError = tostring(result)
		_EmNativeStage("runtime-error")
		error("EmorceHub: " .. tostring(診断.runtimeError), 0)
	end
	診断.sourceTag = sourceTag
	診断.elapsed = os.clock() - 診断.startedAt
	_EmNativeStage("runtime-ready")
	return result
end

環境.__EmorceBootstrapStop = function()
	_EmNativeStage("stopped")
	if type(環境.EmorceUIStop) == "function" then
		pcall(環境.EmorceUIStop)
	end
end

_EmNativeStage("bootstrap-main")

local source, tagOrErr = ソース解決()
if not source then
	warn("[Emorce Bootstrap] could not resolve payload:", tagOrErr)
	warn("[Emorce Bootstrap] discord:", 設定.discord)
	_EmNativeStage("abort")
	error("EmorceHub: payload resolve failed · " .. tostring(tagOrErr), 0)
end

local function 起動()
	ランタイム開始(source, tagOrErr)
end

if task and type(task.defer) == "function" then
	task.defer(起動)
else
	起動()
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
