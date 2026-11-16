"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

const PUBLIC = ["/gate", "/view", "/tos", "/privacy", "/about"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [gated, setGated] = useState(false);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const siteOk = sessionStorage.getItem("emorce_site_gate") === "1";
      setGated(siteOk);
      const sessionOk = sessionStorage.getItem("emorce_session") === "1";
      const raw = localStorage.getItem("emorce_user");
      if (sessionOk && raw) setUser(JSON.parse(raw));
      else setUser(null);
    } catch {
      setUser(null);
      setGated(false);
    }
    setReady(true);
  }, [path]);

  useEffect(() => {
    if (!ready) return;
    const isView = path.startsWith("/view");
    const isPublic = PUBLIC.some((p) => path === p || path.startsWith(p + "/"));
    if (!gated && !isView && path !== "/gate") {
      router.replace("/gate");
      return;
    }
    if (gated && !user && !isPublic && path !== "/login") {
      router.replace("/login");
    }
  }, [ready, gated, user, path, router]);

  if (path === "/gate" || path.startsWith("/view")) {
    return <div className="min-h-screen bg-[#050508] text-[#e8e8f0]">{children}</div>;
  }

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

  if (!gated) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-[#6b6b80] text-sm">
        locked...
      </div>
    );
  }

  if (!user) {
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
