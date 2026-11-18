/**
 * EmorceHub protection stack
 * light | encoded | hardened | honey | volt | hexedvm
 * All pure Luau-safe (no external deps). Source never clear in loader.
 */

function toBase64(input: string): string {
  return Buffer.from(input, "utf8").toString("base64");
}

function chunkB64(payload: string, size = 80): string {
  const chunks: string[] = [];
  for (let i = 0; i < payload.length; i += size) {
    chunks.push(payload.slice(i, i + size));
  }
  return chunks.map((c) => `"${c}"`).join(",");
}

const LUA_B64_DECODE = `local B='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
local function dec(data)
data=string.gsub(data,'[^'..B..'=]','')
return (data:gsub('.',function(x)
if x=='=' then return '' end
local r,f='',(B:find(x)-1)
for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
return r
end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x)
if #x~=8 then return '' end
local c=0
for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
return string.char(c)
end))
end`;

/** HoneyLUA-style anti-tamper — Roblox-safe (no string.dump / debug presence kills) */
const HONEY_ANTITAMPER = `
local function __em_hny_fail()
  error("EmorceHub: The Bee Caught You Stealing It's Honey!", 0)
end
do
  local rg, rs, ty, pc = rawget, rawset, type, pcall
  local G = _G
  local env = G
  do
    local gf = rg(G, "getfenv")
    if ty(gf) == "function" then
      local ok, e = pc(gf, 0)
      if ok and ty(e) == "table" then env = e end
    end
  end
  -- only fail on active debug HOOK (steppers), not on presence of debug/getinfo
  local dbg = rg(env, "debug")
  if ty(dbg) == "table" then
    local gh = rg(dbg, "gethook")
    if ty(gh) == "function" then
      local ok, h = pc(gh)
      if ok and h ~= nil and h ~= false then __em_hny_fail() end
    end
  end
  -- common exploit / deobf globals only
  local bad = {"__PID","__ENT","__PLAST","__PF","__PA","__PK","__SKIPP","__SPIN","__venv","__LASTRET","__hny_genv_probe_9f3a"}
  for i = 1, #bad do
    if rg(env, bad[i]) ~= nil then __em_hny_fail() end
  end
  -- getgenv write probe (if getgenv exists and is broken, fail)
  local ggenv = rg(env, "getgenv")
  if ty(ggenv) == "function" then
    local ok, t = pc(ggenv)
    if ok and ty(t) == "table" then
      local k = "__em_hny_probe"
      local sok = pc(rs, t, k, 1)
      if sok then
        if t[k] ~= 1 then __em_hny_fail() end
        pc(rs, t, k, nil)
      end
    end
  end
end
`;

/** Voltfuscator-inspired outer environment + primitive checks */
const VOLT_ANTITAMPER = `
local function __em_vfail(code)
  error("EmorceHub/Volt: " .. tostring(code), 0)
end
do
  local env = _G
  local gf = env.getfenv or getfenv
  if type(gf) == "function" then
    local ok, r = pcall(gf)
    if ok and type(r) == "table" then env = r end
  end
  if type(env.game) == "table" or type(env.game) == "userdata" then
    local ok, valid = pcall(function()
      if type(env.typeof) ~= "function" then return false end
      if env.typeof(env.game) ~= "Instance" then return false end
      if env.game.ClassName ~= "DataModel" then return false end
      return true
    end)
    if not ok or not valid then __em_vfail("C092") end
  end
  local p = {
    pcall = env.pcall or pcall,
    select = env.select or select,
    type = env.type or type,
    rawget = env.rawget or rawget,
    tostring = env.tostring or tostring,
    floor = (env.math or math).floor,
  }
  for n, f in pairs(p) do
    if type(f) ~= "function" then __em_vfail("C063") end
  end
  local ok =
    p.select("#", 1, 2, 3) == 3
    and p.type(1) == "number"
    and p.floor(1.9) == 1
    and p.rawget({x = 1}, "x") == 1
    and p.tostring(42) == "42"
  if not ok then __em_vfail("C065") end
end
`;

export function lightProtect(source: string, id: string): string {
  return `--[[ EMORCE HUB · ${id} ]]\n` + source;
}

export function buildEncodedLoader(source: string, id: string): string {
  const payload = toBase64(source);
  const table = chunkB64(payload);
  return `--[[ EMORCE HUB PROTECTED · ${id} ]]
${LUA_B64_DECODE}
local P={${table}}
local S=table.concat(P)
local C=dec(S)
local L=loadstring or load
local F,E=L(C)
if not F then error("EmorceHub: "..tostring(E),0) end
F()
`;
}

export function buildHardenedLoader(source: string, id: string): string {
  const outer = toBase64(toBase64(source));
  const table = chunkB64(outer);
  const noise = Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 20).join(",");
  return `--[[ EMORCE HUB HARDENED · ${id} ]]
${LUA_B64_DECODE}
local _N={${noise}}
local P={${table}}
local S=table.concat(P)
local T=dec(S)
local C=dec(T)
local L=loadstring or load
local F,E=L(C)
if not F then error("EmorceHub: "..tostring(E),0) end
F()
`;
}

export function buildHoneyLoader(source: string, id: string): string {
  const outer = toBase64(toBase64(source));
  const table = chunkB64(outer);
  return `--[[ EMORCE HUB HONEY · ${id} ]]
${HONEY_ANTITAMPER}
${LUA_B64_DECODE}
local P={${table}}
local S=table.concat(P)
local T=dec(S)
local C=dec(T)
local L=loadstring or load
local F,E=L(C)
if not F then error("EmorceHub: "..tostring(E),0) end
F()
`;
}

export function buildVoltLoader(source: string, id: string): string {
  const b64 = toBase64(source);
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 33 + id.charCodeAt(i)) >>> 0;
  if (seed === 0) seed = 0x9e3779b9;
  const xored: number[] = [];
  for (let i = 0; i < b64.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    xored.push(b64.charCodeAt(i) ^ (seed & 0xff));
  }
  const parts: string[] = [];
  for (let i = 0; i < xored.length; i += 40) {
    parts.push(xored.slice(i, i + 40).join(","));
  }
  const tables = parts.map((p) => `{${p}}`).join(",");
  let seedInit = 0;
  for (let i = 0; i < id.length; i++) seedInit = (seedInit * 33 + id.charCodeAt(i)) >>> 0;
  if (seedInit === 0) seedInit = 0x9e3779b9;

  return `--[[ EMORCE HUB VOLT · ${id} ]]
${VOLT_ANTITAMPER}
${HONEY_ANTITAMPER}
${LUA_B64_DECODE}
local seed=${seedInit}
local parts={${tables}}
local bytes={}
for _,part in ipairs(parts) do
  for _,v in ipairs(part) do
    seed=(seed*1103515245+12345)%4294967296
    bytes[#bytes+1]=string.char(bit32 and bit32.bxor(v,seed%256) or (function(a,b)
      local r,p=0,1
      while a>0 or b>0 do
        local ab,bb=a%2,b%2
        if ab~=bb then r=r+p end
        a=(a-ab)/2;b=(b-bb)/2;p=p*2
      end
      return r
    end)(v,seed%256))
  end
end
local S=table.concat(bytes)
local C=dec(S)
local L=loadstring or load
local F,E=L(C)
if not F then error("EmorceHub: "..tostring(E),0) end
F()
`;
}

export function buildHexedVmLoader(source: string, id: string): string {
  let seed = 0xc0ffee;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  let roll = seed;
  const encoded: number[] = [];
  for (let i = 0; i < source.length; i++) {
    const b = source.charCodeAt(i) & 0xff;
    roll = (roll * 1664525 + 1013904223) >>> 0;
    encoded.push(perm[b] ^ (roll & 0xff));
  }
  const parts: string[] = [];
  for (let i = 0; i < encoded.length; i += 48) {
    parts.push(encoded.slice(i, i + 48).join(","));
  }
  const codeTables = parts.map((p) => `{${p}}`).join(",");
  const permLit = perm.join(",");
  const seedLit = seed >>> 0;

  return `--[[ EMORCE HEXED VM · ${id} ]]
${VOLT_ANTITAMPER}
${HONEY_ANTITAMPER}
local _P={${permLit}}
local _S=${seedLit}
local _C={${codeTables}}
local out={}
local roll=_S
for _,block in ipairs(_C) do
  for _,v in ipairs(block) do
    roll=(roll*1664525+1013904223)%4294967296
    local x=v
    if bit32 then x=bit32.bxor(v,roll%256) else
      local a,b,r,p=v,roll%256,0,1
      while a>0 or b>0 do
        local ab,bb=a%2,b%2
        if ab~=bb then r=r+p end
        a=(a-ab)/2;b=(b-bb)/2;p=p*2
      end
      x=r
    end
    local inv=nil
    for i=0,255 do if _P[i+1]==x then inv=i break end end
    if inv==nil then error("EmorceHub: VM corrupt",0) end
    out[#out+1]=string.char(inv)
  end
end
local src=table.concat(out)
local L=loadstring or load
local F,E=L(src)
if not F then error("EmorceHub: "..tostring(E),0) end
F()
`;
}

export type ProtectStrength =
  | "light"
  | "encoded"
  | "hardened"
  | "honey"
  | "volt"
  | "hexedvm";

export function protect(
  source: string,
  id: string,
  strength: ProtectStrength
): string {
  switch (strength) {
    case "light":
      return lightProtect(source, id);
    case "encoded":
      return buildEncodedLoader(source, id);
    case "hardened":
      return buildHardenedLoader(source, id);
    case "honey":
      return buildHoneyLoader(source, id);
    case "volt":
      return buildVoltLoader(source, id);
    case "hexedvm":
      return buildHexedVmLoader(source, id);
    default:
      return buildEncodedLoader(source, id);
  }
}
