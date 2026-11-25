"use client";

import { useState } from "react";

export default function GatePage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function submit() {
    setError("");
    if (key.trim().toLowerCase() === "demorce22") {
      try {
        sessionStorage.setItem("emorce_site_gate", "1");
      } catch {}
      window.location.href = "/login";
      return;
    }
    setError("invalid access key");
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url(https://i.pinimg.com/736x/18/19/e2/1819e267c285b3349531a7c1e6161f42.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
      <div
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#c41e3a]/35 bg-[#0a0a10]/95 shadow-[0_0_60px_rgba(196,30,58,0.15)] ${
          shake ? "animate-pulse" : ""
        }`}
      >
        <div className="px-6 pt-6 pb-4 border-b border-[#1a1a24] flex items-center gap-3">
          <img
            src="https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg"
            alt=""
            className="w-12 h-12 rounded-full object-cover border border-[#c41e3a]/50"
          />
          <div>
            <div className="text-lg font-bold text-white tracking-tight">EmorceHub</div>
            <div className="text-[10px] text-[#6b6b80] tracking-[0.2em] font-mono">
              // ACCESS REQUIRED
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <div className="text-sm text-[#c8c8d8]">Enter Access</div>
            <div className="text-[11px] text-[#5a5a6a]">
              Site key unlocks login · scripts stay bound to your API key
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-2">
              // SITE KEY
            </div>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="demorce22"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#050508] border border-[#1a1a24] text-sm font-mono text-center text-[#e8e8f0] placeholder:text-[#3a3a4a] focus:outline-none focus:border-[#c41e3a]/70"
            />
          </div>

          {error && (
            <div className="text-center text-sm text-red-400 font-mono">{error}</div>
          )}

          <button
            type="button"
            onClick={submit}
            className="w-full py-3 rounded-xl bg-[#c41e3a] text-white text-sm font-semibold tracking-wide hover:opacity-90 transition"
          >
            Enter Access
          </button>

          <div className="flex items-center justify-between text-[10px] text-[#4a4a5a] pt-1">
            <span>Emorce only</span>
            <a
              href="https://discord.gg/zSkE4yWHGj"
              target="_blank"
              rel="noreferrer"
              className="text-[#00e5ff]/70 hover:text-[#00e5ff]"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
