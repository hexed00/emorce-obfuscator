"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    section: "MAIN",
    items: [
      { href: "/obfuscator", label: "Obfuscator", icon: "*" },
      { href: "/saved", label: "Saved Scripts", icon: "*" },
      { href: "/keys", label: "Key Manager", icon: "*" },
      { href: "/integrations", label: "Integrations", icon: "*" },
    ],
  },
  {
    section: "TOOLS",
    items: [
      { href: "/shared", label: "Shared", icon: "*" },
      { href: "/collab", label: "Collab", icon: "*" },
      { href: "/analytics", label: "Analytics", icon: "*" },
      { href: "/key-status", label: "Key Status", icon: "*" },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { href: "/settings", label: "Settings", icon: "*" },
      { href: "/login", label: "API Key Login", icon: "*" },
    ],
  },
  {
    section: "LEGAL",
    items: [
      { href: "/tos", label: "Terms of Service", icon: "*" },
      { href: "/privacy", label: "Privacy Policy", icon: "*" },
      { href: "/about", label: "Help", icon: "*" },
    ],
  },
];

export default function Sidebar({ user }: { user?: { name: string } | null }) {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-[#1a1a24] bg-[#08080e] min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-[#1a1a24] flex items-center gap-2">
        <img
          src="https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg"
          alt=""
          className="w-7 h-7 rounded-full object-cover border border-[#c41e3a]/40"
        />
        <div>
          <div className="text-[#00e5ff] font-bold tracking-tight leading-tight">EmorceHub</div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest">// SCRIPT PROTECTION</div>
        </div>
      </div>
      {user && (
        <div className="px-4 py-3 border-b border-[#1a1a24] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#c41e3a] flex items-center justify-center text-xs font-bold text-black">
            {(user.name || "e")[0].toUpperCase()}
          </div>
          <div className="text-sm text-[#e8e8f0] truncate">{user.name}</div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV.map((sec) => (
          <div key={sec.section}>
            <div className="px-2 text-[10px] text-[#4a4a5a] tracking-widest mb-1">{sec.section}</div>
            <div className="space-y-0.5">
              {sec.items.map((it) => {
                const active = path === it.href || path.startsWith(it.href + "/");
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${
                      active
                        ? "bg-[#0e2a30] text-[#00e5ff] border-l-2 border-[#00e5ff]"
                        : "text-[#9a9ab0] hover:bg-[#0c0c12] hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] opacity-60 w-4">{it.icon}</span>
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-[#1a1a24] space-y-1">
        <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[#9a9ab0] hover:text-[#00e5ff]">
          Discord Server
        </a>
        <div className="px-2 text-[10px] text-[#3a3a4a] font-mono">emorce · owner gated</div>
      </div>
    </aside>
  );
}
