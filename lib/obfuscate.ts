import { buildIrVmLoader } from "./irvm";
export { buildIrVmLoader };
export { wrapWeAreDevs } from "./wrd";
/**
 * EmorceHub protection stack — HEXED VM v3 + IRVM
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

function seedFromId(id: string, base = 0x9e3779b9): number {
  let s = base >>> 0;
  for (let i = 0; i < id.length; i++) s = (s * 33 + id.charCodeAt(i)) >>> 0;
  return s || base;
}

function rndName(seed: number, prefix: string): string {
  let s = seed >>> 0;
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = prefix;
  for (let i = 0; i < 6; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    out += chars[s % chars.length];
  }
  return out;
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
  local dbg = rg(env, "debug")
  if ty(dbg) == "table" then
    local gh = rg(dbg, "gethook")
    if ty(gh) == "function" then
      local ok, h = pc(gh)
      if ok and h ~= nil and h ~= false then __em_hny_fail() end
    end
  end
  local bad = {"__PID","__ENT","__PLAST","__PF","__PA","__PK","__SKIPP","__SPIN","__venv","__LASTRET","__hny_genv_probe_9f3a"}
  for i = 1, #bad do
    if rg(env, bad[i]) ~= nil then __em_hny_fail() end
  end
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
  let seed = seedFromId(id);
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
  const seedInit = seedFromId(id);

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
  const seed0 = seedFromId(id, 0xc0ffee);
  let seed = seed0;
  const sbox = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    const t = sbox[i];
    sbox[i] = sbox[j];
    sbox[j] = t;
  }

  const slices: string[] = [];
  {
    const lines = source.split("\n");
    let buf = "";
    seed = seed0;
    for (const line of lines) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const target = 200 + (seed % 200);
      if (buf.length + line.length + 1 > target && buf.length > 80) {
        slices.push(buf);
        buf = line + "\n";
      } else {
        buf += line + "\n";
      }
    }
    if (buf.length) slices.push(buf);
    if (!slices.length) slices.push(source || " ");
  }

  function encodeSlice(text: string, s1: number, s2: number): number[] {
    let a = s1 >>> 0;
    let b = s2 >>> 0;
    const out: number[] = [];
    for (let k = 0; k < text.length; k++) {
      a = (a * 1664525 + 1013904223) >>> 0;
      b = (b * 1103515245 + 12345) >>> 0;
      const ch = text.charCodeAt(k) & 0xff;
      out.push(sbox[ch] ^ (a & 0xff) ^ (b & 0xff));
    }
    return out;
  }

  type Slot = { op: number; s1: number; s2: number; data: number[]; order: number };
  const realSlots: Slot[] = slices.map((text, idx) => {
    const s1 = (seed0 + idx * 9973) >>> 0;
    const s2 = (seed0 ^ (idx * 7919)) >>> 0;
    return { op: 1, s1, s2, data: encodeSlice(text, s1, s2), order: idx };
  });

  const decoys: Slot[] = [];
  const decoyCount = Math.min(6, Math.max(3, Math.floor(slices.length / 2)));
  for (let d = 0; d < decoyCount; d++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const flen = 100 + (seed % 120);
    const data: number[] = [];
    for (let k = 0; k < flen; k++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data.push(seed & 0xff);
    }
    decoys.push({
      op: 0,
      s1: seed >>> 0,
      s2: (seed ^ 0xabcdef) >>> 0,
      data,
      order: -1,
    });
  }

  const stream: Slot[] = [];
  let ri = 0;
  let di = 0;
  seed = seed0 ^ 0x5bd1e995;
  while (ri < realSlots.length || di < decoys.length) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    if (di < decoys.length && (ri >= realSlots.length || (seed & 3) === 0)) {
      stream.push(decoys[di++]);
    } else {
      stream.push(realSlots[ri++]);
    }
  }

  function packData(data: number[]): string {
    const parts: string[] = [];
    for (let p = 0; p < data.length; p += 40) {
      parts.push(`{${data.slice(p, p + 40).join(",")}}`);
    }
    return `{${parts.join(",")}}`;
  }

  const streamLit = stream
    .map(
      (s) =>
        `{op=${s.op},s1=${s.s1},s2=${s.s2},ord=${s.order},d=${packData(s.data)}}`
    )
    .join(",");

  const sboxLit = sbox.join(",");
  const nReal = slices.length;
  const chk =
    (source.length * 131 +
      (source.charCodeAt(0) || 0) * 17 +
      (source.charCodeAt(Math.max(0, source.length - 1)) || 0) * 31) >>>
    0;

  const nSB = rndName(seed0, "_");
  const nST = rndName(seed0 + 1, "_");
  const nINV = rndName(seed0 + 2, "_");
  const nBX = rndName(seed0 + 3, "_");
  const nDEC = rndName(seed0 + 4, "_");
  const nBUF = rndName(seed0 + 5, "_");
  const nRUN = rndName(seed0 + 6, "_");

  return `--[[ EMORCE HEXED VM v3 · ${id} ]]
${VOLT_ANTITAMPER}
${HONEY_ANTITAMPER}
local ${nSB}={${sboxLit}}
local ${nST}={${streamLit}}
local ${nINV}={}
for i=0,255 do ${nINV}[${nSB}[i+1]]=i end
local function ${nBX}(a,b)
  if bit32 then return bit32.bxor(a,b) end
  local r,p=0,1
  a=a%256;b=b%256
  while a>0 or b>0 do
    local ab,bb=a%2,b%2
    if ab~=bb then r=r+p end
    a=(a-ab)/2;b=(b-bb)/2;p=p*2
  end
  return r
end
local function ${nDEC}(slot)
  if slot.op~=1 then return nil end
  local a,b=slot.s1,slot.s2
  local out={}
  for _,blk in ipairs(slot.d) do
    for _,v in ipairs(blk) do
      a=(a*1664525+1013904223)%4294967296
      b=(b*1103515245+12345)%4294967296
      local x=${nBX}(${nBX}(v,a%256),b%256)
      local inv=${nINV}[x]
      if inv==nil then return nil end
      out[#out+1]=string.char(inv)
    end
  end
  return table.concat(out)
end
local _ok=((7*7-49)==0) and (1==1)
if not _ok then error("EmorceHub: opaque",0) end
local ${nBUF}={}
local got=0
for _,slot in ipairs(${nST}) do
  if slot.op==1 then
    local frag=${nDEC}(slot)
    if not frag then error("EmorceHub: VM corrupt",0) end
    ${nBUF}[slot.ord+1]=frag
    got=got+1
  end
end
if got~=${nReal} then error("EmorceHub: VM incomplete",0) end
local function ${nRUN}()
  local parts={}
  for i=1,${nReal} do
    parts[i]=${nBUF}[i]
    ${nBUF}[i]=nil
  end
  local src=table.concat(parts)
  for i=1,#parts do parts[i]=nil end
  local L=loadstring or load
  local F,E=L(src)
  src=nil
  if not F then error("EmorceHub: "..tostring(E),0) end
  return F()
end
return ${nRUN}()
`;
}

export type ProtectStrength =
  | "light"
  | "encoded"
  | "hardened"
  | "honey"
  | "volt"
  | "hexedvm"
  | "irvm";

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
    case "irvm":
      return buildIrVmLoader(source, id);
    default:
      return buildEncodedLoader(source, id);
  }
}
