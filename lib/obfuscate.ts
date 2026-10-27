/**
 * Lightweight Lua protection banner for EmorceHub.
 * Source is stored server-side; public endpoint returns runnable source.
 * Password only gates the management page.
 */

export function lightProtect(source: string, id: string): string {
  const banner = `--[[
  ╔══════════════════════════════════════╗
  ║          EMORCE HUB PROTECTED        ║
  ║     https://emorcehub.vercel.app     ║
  ║  Script ID: ${id.padEnd(24)} ║
  ╚══════════════════════════════════════╝
]]\n`;
  return banner + source;
}
