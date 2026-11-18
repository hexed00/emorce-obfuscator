/**
 * Emorce IRVM — dual-stream cells, decoys, nested load barrier
 */
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
end
`;
const VOLT_ANTITAMPER = `
local function __em_vfail(code)
  error("EmorceHub/Volt: " .. tostring(code), 0)
end
do
  local env = _G
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
  if not ok then __em_vfail("C065") end
end
`;

export function buildIrVmLoader(source: string, id: string): string {
  const seed0 = seedFromId(id, 0xdead1000);
  let seed = seed0 >>> 0;
  const sbox = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    const t = sbox[i];
    sbox[i] = sbox[j];
    sbox[j] = t;
  }
  const cells: string[] = [];
  {
    const lines = source.split("\n");
    let buf = "";
    seed = seed0;
    for (const line of lines) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const target = 140 + (seed % 180);
      if (buf.length + line.length + 1 > target && buf.length > 50) {
        cells.push(buf);
        buf = line + "\n";
      } else {
        buf += line + "\n";
      }
    }
    if (buf.length) cells.push(buf);
    if (!cells.length) cells.push(source || " ");
  }
  function enc(text: string, s1: number, s2: number): number[] {
    let a = s1 >>> 0;
    let b = s2 >>> 0;
    const out: number[] = [];
    for (let k = 0; k < text.length; k++) {
      a = (a * 1664525 + 1013904223) >>> 0;
      b = (b * 1103515245 + 12345) >>> 0;
      const ch = text.charCodeAt(k) & 0xff;
      out.push(sbox[ch] ^ (a & 0xff) ^ ((b >>> 8) & 0xff));
    }
    return out;
  }
  type Cell = { r: number; s1: number; s2: number; i: number; data: number[] };
  const real: Cell[] = cells.map((text, idx) => {
    const s1 = (seed0 + idx * 2654435761) >>> 0;
    const s2 = (seed0 ^ (idx * 1597334677)) >>> 0;
    return { r: 1, s1, s2, i: idx, data: enc(text, s1, s2) };
  });
  const decoys: Cell[] = [];
  const dc = Math.min(8, Math.max(4, Math.floor(cells.length / 2)));
  for (let d = 0; d < dc; d++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const flen = 90 + (seed % 110);
    const data: number[] = [];
    for (let k = 0; k < flen; k++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data.push(seed & 0xff);
    }
    decoys.push({ r: 0, s1: seed >>> 0, s2: (seed ^ 0xa5a5a5a5) >>> 0, i: -1, data });
  }
  const stream: Cell[] = [];
  let ri = 0, di = 0;
  seed = seed0 ^ 0x9e3779b9;
  while (ri < real.length || di < decoys.length) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    if (di < decoys.length && (ri >= real.length || (seed & 3) === 0)) stream.push(decoys[di++]);
    else stream.push(real[ri++]);
  }
  function pack(data: number[]): string {
    const parts: string[] = [];
    for (let p = 0; p < data.length; p += 36) parts.push(`{${data.slice(p, p + 36).join(",")}}`);
    return `{${parts.join(",")}}`;
  }
  const streamLit = stream.map((c) => `{r=${c.r},s1=${c.s1},s2=${c.s2},i=${c.i},d=${pack(c.data)}}`).join(",");
  const sboxLit = sbox.join(",");
  const nReal = cells.length;
  const chk = (source.length * 131 + (source.charCodeAt(0) || 0) * 17 + (source.charCodeAt(Math.max(0, source.length - 1)) || 0) * 31) >>> 0;
  const nSB = rndName(seed0, "_");
  const nST = rndName(seed0 + 11, "_");
  const nINV = rndName(seed0 + 22, "_");
  const nBX = rndName(seed0 + 33, "_");
  const nDEC = rndName(seed0 + 44, "_");
  const nBUF = rndName(seed0 + 55, "_");
  const nRUN = rndName(seed0 + 66, "_");
  return `--[[ EMORCE IRVM · ${id} ]]
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
local function ${nDEC}(cell)
  if cell.r~=1 then return nil end
  local a,b=cell.s1,cell.s2
  local out={}
  for _,blk in ipairs(cell.d) do
    for _,v in ipairs(blk) do
      a=(a*1664525+1013904223)%4294967296
      b=(b*1103515245+12345)%4294967296
      local x=${nBX}(${nBX}(v,a%256),(math.floor(b/256)%256))
      local inv=${nINV}[x]
      if inv==nil then return nil end
      out[#out+1]=string.char(inv)
    end
  end
  return table.concat(out)
end
local _op=((3*5-15)==0) and (2+2==4)
if not _op then error("EmorceHub: opaque",0) end
local ${nBUF}={}
local got=0
for _,cell in ipairs(${nST}) do
  if cell.r==1 then
    local frag=${nDEC}(cell)
    if not frag then error("EmorceHub: IR corrupt",0) end
    ${nBUF}[cell.i+1]=frag
    got=got+1
  end
end
if got~=${nReal} then error("EmorceHub: IR incomplete",0) end
local function ${nRUN}()
  local parts={}
  for i=1,${nReal} do
    parts[i]=${nBUF}[i]
    ${nBUF}[i]=nil
  end
  local src=table.concat(parts)
  for i=1,#parts do parts[i]=nil end
  local csum=(#src*131+(string.byte(src,1) or 0)*17+(string.byte(src,#src) or 0)*31)%4294967296
  if csum~=${chk} then error("EmorceHub: IR integrity",0) end
  local L=loadstring or load
  local F,E=L(src)
  src=nil
  if not F then error("EmorceHub: "..tostring(E),0) end
  return F()
end
return ${nRUN}()
`;
}
