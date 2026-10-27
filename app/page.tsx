"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [source, setSource] = useState("");
  const [password, setPassword] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [strength, setStrength] = useState<"light" | "encoded" | "hardened">("encoded");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    loadstring: string;
    offlineLoadstring: string;
    apiUrl: string;
    key: string;
    chars: number;
    strength: string;
    id?: string;
    customPath?: string | null;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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
        headers: {
          "Content-Type": "application/json",
          "x-emorce-key": typeof window !== "undefined" ? localStorage.getItem("emorce_api_key") || "" : "",
        },
        body: JSON.stringify({
          source,
          password,
          customPath: customPath.trim() || undefined,
          strength,
          apiKey: typeof window !== "undefined" ? localStorage.getItem("emorce_api_key") || "" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
      try {
        const apiKey = localStorage.getItem("emorce_api_key") || "";
        if (apiKey && data.key) {
          const listKey = "emorce_scripts_" + apiKey.slice(0, 24);
          const prev = JSON.parse(localStorage.getItem(listKey) || "[]");
          const entry = {
            id: data.id || data.key,
            key: data.key,
            strength: data.strength || "encoded",
            chars: data.chars || 0,
            createdAt: Date.now(),
            customPath: data.customPath || null,
          };
          const next = [entry, ...prev.filter((x: any) => x.key !== entry.key)].slice(0, 200);
          localStorage.setItem(listKey, JSON.stringify(next));
        }
      } catch {}
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, which: string) {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
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
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center">
            <div className="text-2xl font-bold">∞</div>
            <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Protection</div>
          </div>
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center">
            <div className="text-2xl font-bold text-[#00e5ff]">3</div>
            <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Modes</div>
          </div>
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center">
            <div className="text-2xl font-bold text-[#c41e3a]">100%</div>
            <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Secure</div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1a1a24] text-sm font-medium text-[#c41e3a]">New Script</div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// PASTE LUA SCRIPT</div>
              <textarea value={source} onChange={(e) => setSource(e.target.value)} placeholder="-- Paste your Lua script here..." spellCheck={false} className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm font-mono text-[#b8b8c8] placeholder:text-[#3a3a4a] focus:outline-none focus:border-[#c41e3a]/50" />
              <div className="mt-1 flex items-center justify-between">
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-[#9a9ab0] border border-[#1a1a24] px-3 py-1.5 rounded-lg hover:border-[#c41e3a]/50">Upload .lua / .txt</button>
                <span className="text-[10px] text-[#4a4a5a] font-mono">{chars} chars</span>
              </div>
              <input ref={fileRef} type="file" accept=".lua,.txt,.luau" className="hidden" onChange={onFile} />
            </div>

            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// PROTECTION LEVEL</div>
              <div className="grid grid-cols-3 gap-2">
                {([{ id: "light", label: "Light", desc: "Banner only" }, { id: "encoded", label: "Encoded", desc: "Base64 + loadstring" }, { id: "hardened", label: "Hardened", desc: "Double base64" }] as const).map((o) => (
                  <button key={o.id} type="button" onClick={() => setStrength(o.id)} className={`rounded-lg border px-3 py-2 text-left transition ${strength === o.id ? "border-[#c41e3a] bg-[#c41e3a]/15 text-white" : "border-[#1a1a24] bg-[#050508] text-[#9a9ab0] hover:border-[#c41e3a]/40"}`}>
                    <div className="text-sm font-medium">{o.label}</div>
                    <div className="text-[10px] opacity-70">{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// PASSWORD</div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a secure password (5-20 characters)..." maxLength={20} className="w-full px-4 py-2.5 pr-16 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm focus:outline-none focus:border-[#c41e3a]/50" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b6b80]">{showPw ? "hide" : "show"}</button>
              </div>
              <p className="mt-1 text-[11px] text-[#6b6b80]">Password only for manage page. Execution does not need it.</p>
            </div>

            <div>
              <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mb-2 font-mono">// CUSTOM PATH (OPTIONAL)</div>
              <input type="text" value={customPath} onChange={(e) => setCustomPath(e.target.value)} placeholder="my-script (3-20: letters, numbers, - _)" maxLength={20} className="w-full px-4 py-2.5 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm font-mono focus:outline-none focus:border-[#c41e3a]/50" />
            </div>

            {error && <div className="text-sm text-red-400 border border-red-900/50 bg-red-950/40 px-3 py-2 rounded-lg">{error}</div>}

            <button type="button" onClick={protect} disabled={loading} className="w-full py-3 rounded-lg bg-[#c41e3a] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">{loading ? "Protecting..." : "Protect Script"}</button>
          </div>
        </div>

        {result && (
          <div className="rounded-xl border border-[#c41e3a]/40 bg-[#0c0c12] overflow-hidden space-y-0">
            <div className="px-5 py-3 border-b border-[#1a1a24] bg-[#c41e3a]/10 text-sm text-[#c41e3a] font-medium">
              Protected ({result.strength}) — saved to your API key
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest font-mono mb-2">// HOSTED LOADSTRING</div>
                <div className="flex gap-2">
                  <input readOnly value={result.loadstring} className="flex-1 px-3 py-2 rounded-lg border border-[#1a1a24] bg-[#050508] text-xs font-mono text-[#00e5ff]" />
                  <button type="button" onClick={() => copy(result.loadstring, "hosted")} className="px-3 py-2 rounded-lg border border-[#1a1a24] text-xs text-[#9a9ab0] hover:text-white">
                    {copied === "hosted" ? "copied" : "copy"}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-green-400 uppercase tracking-widest font-mono mb-2">// OFFLINE LOADSTRING</div>
                <div className="flex gap-2">
                  <textarea readOnly value={result.offlineLoadstring} rows={3} className="flex-1 px-3 py-2 rounded-lg border border-green-900/40 bg-[#050508] text-[11px] font-mono text-green-300 focus:outline-none" />
                  <button type="button" onClick={() => copy(result.offlineLoadstring, "offline")} className="px-3 py-2 h-fit rounded-lg border border-green-900/40 text-xs text-green-400">
                    {copied === "offline" ? "copied" : "copy"}
                  </button>
                </div>
              </div>
              <a href={`/script/${result.key}`} className="text-sm text-[#c41e3a] hover:underline block">
                Manage → /script/{result.key}
              </a>
              <div className="text-[11px] text-[#6b6b80] font-mono">{result.chars} chars · key: {result.key}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
