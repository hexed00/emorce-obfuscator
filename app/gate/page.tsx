"use client";

import { useEffect } from "react";

/** Legacy /gate → homepage landing (Enter Access lives on /) */
export default function GateRedirect() {
  useEffect(() => {
    window.location.replace("/");
  }, []);
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-[#6b6b80] text-sm">
      EmorceHub
    </div>
  );
}
