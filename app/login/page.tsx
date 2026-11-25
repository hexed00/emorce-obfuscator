"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultKey, setResultKey] = useState("");

  async function signup() {
    setError("");
    setLoading(true);
    setResultKey("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "emorce" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "signup failed");
      setResultKey(data.apiKey);
      localStorage.setItem("emorce_api_key", data.apiKey);
      localStorage.setItem("emorce_user", JSON.stringify({ name: data.name || name || "emorce" }));
      sessionStorage.setItem("emorce_session", "1");
    } catch (e: any) {
      setError(e.message || "error");
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
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "login failed");
      localStorage.setItem("emorce_api_key", apiKey.trim());
      localStorage.setItem("emorce_user", JSON.stringify({ name: data.name || "emorce" }));
      sessionStorage.setItem("emorce_session", "1");
      window.location.href = "/obfuscator";
    } catch (e: any) {
      setError(e.message || "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050508]">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1">
          <img
            src="https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg"
            alt=""
            className="w-14 h-14 rounded-full mx-auto object-cover border border-[#c41e3a]/40"
          />
          <div className="text-xl font-bold text-white">EmorceHub</div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono">// API KEY</div>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-lg text-sm ${mode === "signup" ? "bg-[#c41e3a] text-white" : "border border-[#1a1a24] text-[#9a9ab0]"}`}>
            Sign up
          </button>
          <button type="button" onClick={() => setMode("login")} className={`flex-1 py-2 rounded-lg text-sm ${mode === "login" ? "bg-[#c41e3a] text-white" : "border border-[#1a1a24] text-[#9a9ab0]"}`}>
            Login
          </button>
        </div>

        {mode === "signup" ? (
          <div className="space-y-3 rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5">
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono">// DISPLAY NAME</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm" />
            <button type="button" disabled={loading} onClick={signup} className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium disabled:opacity-50">
              {loading ? "Generating..." : "Generate API Key"}
            </button>
            {resultKey && (
              <div className="space-y-2">
                <div className="text-[10px] text-green-400 tracking-widest font-mono">// SAVE THIS KEY — SHOWN ONCE</div>
                <textarea readOnly value={resultKey} rows={3} className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-green-900/40 text-xs font-mono text-green-300" />
                <button type="button" onClick={() => navigator.clipboard.writeText(resultKey)} className="text-xs text-green-400 border border-green-900/40 px-3 py-1.5 rounded-lg">
                  copy key
                </button>
                <button type="button" onClick={() => { window.location.href = "/obfuscator"; }} className="w-full py-2 rounded-lg border border-[#1a1a24] text-sm text-[#9a9ab0]">
                  Continue to Obfuscator
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5">
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono">// API KEY</div>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="emorce_..." className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm font-mono" />
            <button type="button" disabled={loading} onClick={login} className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium disabled:opacity-50">
              {loading ? "..." : "Login"}
            </button>
          </div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>
    </div>
  );
}
