"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

const PUBLIC = ["/login", "/tos", "/privacy", "/about"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [ready, setReady] = useState(false);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("emorce_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [path]);

  useEffect(() => {
    if (!ready) return;
    const isPublic = PUBLIC.some((p) => path === p || path.startsWith(p + "/"));
    if (!user && !isPublic) {
      router.replace("/login");
    }
  }, [ready, user, path, router]);

  if (path === "/login") {
    return <div className="min-h-screen bg-[#050508] text-[#e8e8f0]">{children}</div>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-[#6b6b80] text-sm">
        EmorceHub
      </div>
    );
  }

  if (!user && !PUBLIC.includes(path)) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-[#6b6b80] text-sm">
        redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050508] text-[#e8e8f0]">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </div>
  );
}
