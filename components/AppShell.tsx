"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

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
    if (path === "/") return;
    if (path.startsWith("/view") || path === "/tos" || path === "/privacy" || path === "/about") return;
    if (path === "/login" || path === "/gate") return;

    if (!gated) {
      router.replace("/");
      return;
    }
    if (!user) {
      router.replace("/login");
    }
  }, [ready, gated, user, path, router]);

  if (
    path === "/" ||
    path === "/gate" ||
    path === "/login" ||
    path.startsWith("/view")
  ) {
    return <div className="min-h-screen bg-[#050508] text-[#e8e8f0]">{children}</div>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-[#6b6b80] text-sm">
        EmorceHub
      </div>
    );
  }

  if (!gated || !user) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-[#6b6b80] text-sm">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-[#e8e8f0] flex">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </div>
  );
}
