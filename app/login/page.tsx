"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [resultKey, setResultKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "user" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setResultKey(data.apiKey);
      localStorage.setItem("emorce_api_key", data.apiKey);
      localStorage.setItem("emorce_user", JSON.stringify({ id: data.id, name: data.name }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      localStorage.setItem("emorce_api_key", apiKey);
      localStorage.setItem("emorce_user", JSON.stringify({ id: data.id, name: data.name }));
      window.location.href = "/";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div
        className="h-48 bg-cover bg-center relative border-b border-[#1a1a24]"
        style={{ backgroundImage: "url(https://i.pinimg.com/1200x/ae/10/46/ae1046db7f07ad1fa52727e5927c5771.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <div className="text-2xl font-bold text-white">API Key Access</div>
          <div className="text-sm text-[#9a9ab0]">Your key is your account. Lose it, lose your scripts.</div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-lg text-sm ${mode === "signup" ? "bg-[#c41e3a] text-white" : "border border-[#1a1a24] text-[#9a9ab0]"}`}>Sign up</button>
          <button type="button" onClick={() => setMode("login")} className={`flex-1 py-2 rounded-lg text-sm ${mode === "login" ? "bg-[#c41e3a] text-white" : "border border-[#1a1a24] text-[#9a9ab0]"}`}>Login</button>
        </div>

        {mode === "signup" ? (
          <div className="space-y-3 rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5">
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono">// DISPLAY NAME</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm" />
            <button type="button" disabled={loading} onClick={signup} className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium disabled:opacity-50">{loading ? "Generating..." : "Generate API Key"}</button>
            {resultKey && (
              <div className="space-y-2">
                <div className="text-[10px] text-green-400 tracking-widest font-mono">// SAVE THIS KEY — SHOWN ONCE</div>
                <textarea readOnly value={resultKey} rows={3} className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-green-900/40 text-xs font-mono text-green-300" />
                <button type="button" onClick={() => navigator.clipboard.writeText(resultKey)} className="text-xs text-green-400 border border-green-900/40 px-3 py-1.5 rounded-lg">copy key</button>
                <p className="text-[11px] text-[#9a9ab0]">Store it offline. No recovery. This key owns your scripts.</p>
                <button type="button" onClick={() => { window.location.href = "/"; }} className="w-full py-2 rounded-lg border border-[#1a1a24] text-sm text-[#9a9ab0]">Continue to Obfuscator</button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5">
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono">// API KEY</div>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="emorce_..." className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm font-mono" />
            <button type="button" disabled={loading} onClick={login} className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium disabled:opacity-50">{loading ? "..." : "Login"}</button>
          </div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}
        <div className="text-center text-[11px] text-[#6b6b80] space-x-3">
          <a href="/tos" className="hover:text-[#00e5ff]">Terms</a>
          <a href="/privacy" className="hover:text-[#00e5ff]">Privacy</a>
          <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="hover:text-[#00e5ff]">Discord</a>
        </div>
      </div>
    </div>
  );
}
