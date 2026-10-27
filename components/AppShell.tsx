"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("emorce_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050508] text-[#e8e8f0]">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </div>
  );
}
