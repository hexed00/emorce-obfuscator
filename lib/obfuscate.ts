/**
 * EmorceHub protection — same model as obfuscatorhub:
 * server stores source; public /api/KEY returns runnable Lua.
 */

function xorEncode(input: string, key: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    out.push(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}

function toLuaNumberTable(nums: number[]): string {
  const parts: string[] = [];
  for (let i = 0; i < nums.length; i += 40) {
    parts.push(nums.slice(i, i + 40).join(","));
  }
  return "{" + parts.join(",") + "}";
}

export function lightProtect(source: string, id: string): string {
  return (
    `--[[\n` +
    `  EMORCE HUB PROTECTED\n` +
    `  https://emorce-obfuscator.vercel.app\n` +
    `  id: ${id}\n` +
    `]]\n` +
    source
  );
}

export function buildEncodedLoader(source: string, id: string): string {
  const key = `emorce_${id}_x7k9`;
  const encoded = xorEncode(source, key);
  const table = toLuaNumberTable(encoded);
  const keyLua = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return `--[[
  ╔══════════════════════════════════════╗
  ║          EMORCE HUB PROTECTED        ║
  ║   https://emorce-obfuscator.vercel.app
  ║  id: ${id}
  ╚══════════════════════════════════════╝
]]
local a=${table}
local b="${keyLua}"
local c={}
for d=1,#a do
local x=a[d]
local y=b:byte((d-1)%#b+1)
c[d]=string.char((bit32 and bit32.bxor(x,y)) or (bit and bit.bxor(x,y)) or (x~y))
end
local e=table.concat(c)
local f=loadstring or load
return f(e)()
`;
}

export function buildHardenedLoader(source: string, id: string): string {
  const key1 = `eh_${id}_a`;
  const key2 = `eh_${id}_b`;
  const mid = xorEncode(source, key1);
  let midStr = "";
  for (const n of mid) midStr += String.fromCharCode(n);
  const final = xorEncode(midStr, key2);
  const table = toLuaNumberTable(final);
  const k1 = key1.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const k2 = key2.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return `--[[ EMORCE HUB · HARDENED · ${id} ]]
local A=${table}
local K1="${k1}"
local K2="${k2}"
local function X(t,k)
local o={}
for i=1,#t do
local b=t[i]
local c=k:byte((i-1)%#k+1)
o[i]=string.char((bit32 and bit32.bxor(b,c)) or (bit and bit.bxor(b,c)) or (b~c))
end
return table.concat(o)
end
local S=X(A,K2)
local T={}
for i=1,#S do T[i]=S:byte(i) end
local U=X(T,K1)
local L=loadstring or load
return L(U)()
`;
}
