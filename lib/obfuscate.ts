/**
 * EmorceHub protection
 * Encoded/Hardened = Base64 payload + pure Lua decoder (Luau-safe)
 */

function toBase64(input: string): string {
  return Buffer.from(input, "utf8").toString("base64");
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

export function lightProtect(source: string, id: string): string {
  return `--[[ EMORCE HUB · ${id} ]]\n` + source;
}

export function buildEncodedLoader(source: string, id: string): string {
  const payload = toBase64(source);
  const chunks: string[] = [];
  for (let i = 0; i < payload.length; i += 80) {
    chunks.push(payload.slice(i, i + 80));
  }
  const table = chunks.map((c) => `"${c}"`).join(",");

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
  const inner = toBase64(source);
  const outer = toBase64(inner);
  const chunks: string[] = [];
  for (let i = 0; i < outer.length; i += 80) {
    chunks.push(outer.slice(i, i + 80));
  }
  const table = chunks.map((c) => `"${c}"`).join(",");
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
