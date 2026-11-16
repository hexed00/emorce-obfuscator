"use client";

import { useState } from "react";

export default function GatePage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function submit() {
    setError("");
    if (key.trim() === "demorce22") {
      sessionStorage.setItem("emorce_site_gate", "1");
      window.location.href = "/login";
      return;
    }
    setError("wrong key");
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden"
      style={{
        backgroundImage:
          "url(https://i.pinimg.com/736x/18/19/e2/1819e267c285b3349531a7c1e6161f42.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className={`relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-[#c41e3a]/40 bg-[#0c0c12]/95 p-6 space-y-4 shadow-2xl ${
          shake ? "animate-pulse" : ""
        }`}
      >
        <div className="text-center space-y-1">
          <img
            src="https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg"
            alt=""
            className="w-14 h-14 rounded-full mx-auto object-cover border border-[#c41e3a]/50"
          />
          <div className="text-xl font-bold text-white mt-2">EmorceHub</div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono">// SITE KEY REQUIRED</div>
        </div>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="enter site key..."
          className="w-full px-4 py-3 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm font-mono text-center focus:outline-none focus:border-[#c41e3a]/60"
        />
        {error && <div className="text-center text-sm text-red-400">{error}</div>}
        <button
          type="button"
          onClick={submit}
          className="w-full py-3 rounded-lg bg-[#c41e3a] text-white text-sm font-medium hover:opacity-90"
        >
          Enter
        </button>
        <p className="text-[11px] text-center text-[#4a4a5a]">Access locked · Emorce only</p>
      </div>
    </div>
  );
}
