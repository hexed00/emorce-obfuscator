"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/obfuscator");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center text-[#6b6b80] text-sm">
      Opening obfuscator…
    </div>
  );
}
