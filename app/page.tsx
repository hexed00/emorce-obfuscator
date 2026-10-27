"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [source, setSource] = useState("");
  const [password, setPassword] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    loadstring: string;
    apiUrl: string;
    key: string;
    chars: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chars = source.length;

  async function protect() {
    setError("");
    setResult(null);
    if (!source.trim()) {
      setError("Paste a script first");
      return;
    }
    if (password.length < 5 || password.length > 20) {
      setError("Password must be 5-20 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          password,
          customPath: customPath.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result || ""));
    reader.readAsText(f);
  }

  return (
    <div className="min-h-screen text-[#e8e8f0]">
      <header className="border-b border-[#1a1a24] bg-[#08080e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#c41e3a] font-bold">EmorceHub</span>
          <span className="text-[#6b6b80] text-sm">// Obfuscator</span>
        </div>
        <div className="text-xs text-[#6b6b80]">100% SECURE</div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center">
            <div className="text-2xl font-bold">1</div>
            <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Total Scripts</div>
          </div>
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center">
            <div className="text-2xl font-bold text-[#00e5ff]">∞</div>
            <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Protection</div>
          </div>
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center">
            <div className="text-2xl font-bold text-[#c41e3a]">100%</div>
            <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Secure</div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1a1a24] text-sm font-medium text-[#c41e3a]">
            New Script
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// PASTE LUA SCRIPT</div>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="-- Paste your Lua script here..."
                spellCheck={false}
                className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm font-mono text-[#b8b8c8] placeholder:text-[#3a3a4a] focus:outline-none focus:border-[#c41e3a]/50"
              />
              <div className="mt-1 text-[10px] text-[#4a4a5a] font-mono">{chars} chars</div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs text-[#9a9ab0] border border-[#1a1a24] px-3 py-1.5 rounded-lg hover:border-[#c41e3a]/50"
              >
                Upload .lua / .txt
              </button>
              <input ref={fileRef} type="file" accept=".lua,.txt,.luau" className="hidden" onChange={onFile} />
            </div>

            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// PASSWORD</div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a secure password (5-20 characters)..."
                  maxLength={20}
                  className="w-full px-4 py-2.5 pr-16 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm focus:outline-none focus:border-[#c41e3a]/50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b6b80]">
                  {showPw ? "hide" : "show"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#6b6b80]">
                Password gates the manage page only. Loadstring always runs for everyone.
              </p>
            </div>

            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// CUSTOM PATH (OPTIONAL)</div>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="my-script (3-20: letters, numbers, - _)"
                maxLength={20}
                className="w-full px-4 py-2.5 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm font-mono focus:outline-none focus:border-[#c41e3a]/50"
              />
            </div>

            {error && <div className="text-sm text-red-400 border border-red-900/50 bg-red-950/40 px-3 py-2 rounded-lg">{error}</div>}

            <button
              type="button"
              onClick={protect}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#c41e3a] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Protecting..." : "Protect Script"}
            </button>
          </div>
        </div>

        {result && (
          <div className="rounded-xl border border-[#c41e3a]/40 bg-[#0c0c12] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1a1a24] bg-[#c41e3a]/10 text-sm text-[#c41e3a] font-medium">
              Protected — loadstring ready
            </div>
            <div className="p-5 space-y-3">
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest font-mono">// LOADSTRING</div>
              <div className="flex gap-2">
                <input readOnly value={result.loadstring} className="flex-1 px-3 py-2 rounded-lg border border-[#1a1a24] bg-[#050508] text-xs font-mono text-[#00e5ff]" />
                <button type="button" onClick={() => copy(result.loadstring)} className="px-3 py-2 rounded-lg border border-[#1a1a24] text-xs text-[#9a9ab0] hover:text-white">
                  {copied ? "copied" : "copy"}
                </button>
              </div>
              <a href={`/script/${result.key}`} className="text-sm text-[#c41e3a] hover:underline">
                Manage page (password required) → /script/{result.key}
              </a>
              <div className="text-[11px] text-[#6b6b80] font-mono">{result.chars} chars · key: {result.key}</div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5 text-sm text-[#9a9ab0] space-y-2">
          <div className="font-medium text-white">How it works</div>
          <p>1. Paste Lua + set password (5-20 chars).</p>
          <p>2. Optional custom path for a clean URL.</p>
          <p>3. Get public loadstring — anyone can run it.</p>
          <p>4. /script/KEY requires the password to view/edit/delete source.</p>
        </div>
      </main>
    </div>
  );
}
