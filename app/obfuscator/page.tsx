"use client";

import { useEffect, useState, useRef } from "react";

const MODES = [
  { id: "irvm", label: "IRVM", desc: "bytecode dual-stream · strongest" },
  { id: "hexedvm", label: "HEXED VM", desc: "LCG + S-box + integrity" },
  { id: "volt", label: "Volt", desc: "anti-tamper environment shell" },
  { id: "honey", label: "Honey", desc: "anti-AI / anti-hook probes" },
  { id: "hardened", label: "Hardened", desc: "encoded + decoy layers" },
  { id: "encoded", label: "Encoded", desc: "fast base64 loader" },
  { id: "light", label: "Light", desc: "minimal wrap" },
] as const;

export default function ObfuscatorPage() {
  const [source, setSource] = useState("");
  const [password, setPassword] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [strength, setStrength] = useState<string>("irvm");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    loadstring: string;
    offlineLoadstring: string;
    apiUrl: string;
    key: string;
    strength: string;
    chars: number;
    id?: string;
    customPath?: string | null;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("emorce_session") !== "1") {
        window.location.href = "/login";
      }
    } catch {}
  }, []);

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
      const apiKey =
        typeof window !== "undefined" ? localStorage.getItem("emorce_api_key") || "" : "";
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-emorce-key": apiKey,
        },
        body: JSON.stringify({
          source,
          password,
          customPath: customPath.trim() || undefined,
          strength,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
      try {
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono mb-1">OBFUSCATOR</div>
          <h1 className="text-2xl font-bold text-white">Protect script</h1>
          <p className="text-sm text-[#8a8a9a] mt-1">Paste Lua · pick mode · set script password · ship loadstring</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#6b6b80]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
          IRVM default · Emorce stack
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center hover:border-[#c41e3a]/40 transition">
          <div className="text-2xl font-bold">∞</div>
          <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Protection</div>
        </div>
        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center hover:border-[#00e5ff]/40 transition">
          <div className="text-2xl font-bold text-[#00e5ff]">7</div>
          <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Modes</div>
        </div>
        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-4 text-center hover:border-[#c41e3a]/40 transition">
          <div className="text-2xl font-bold text-[#c41e3a]">100%</div>
          <div className="text-[10px] text-[#6b6b80] uppercase tracking-widest mt-1">Secure</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a10]/90 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a24] bg-[#08080e]">
              <span className="text-[10px] tracking-widest text-[#6b6b80] font-mono">// SOURCE</span>
              <span className="text-[10px] text-[#4a4a5a] font-mono">{source.length} chars</span>
            </div>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="-- Paste your Lua script here..."
              spellCheck={false}
              className="w-full h-72 md:h-96 px-4 py-3 bg-transparent text-sm font-mono text-[#d8d8e8] placeholder:text-[#3a3a4a] focus:outline-none resize-y min-h-[18rem]"
            />
            <div className="px-4 py-2 border-t border-[#1a1a24] flex items-center justify-between bg-[#08080e]">
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-[#9a9ab0] border border-[#1a1a24] px-3 py-1.5 rounded-lg hover:border-[#c41e3a]/50 transition">
                Upload .lua / .txt
              </button>
              <input ref={fileRef} type="file" accept=".lua,.txt,.luau" className="hidden" onChange={onFile} />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300 font-mono">{error}</div>
          )}

          {result && (
            <div className="rounded-2xl border border-[#c41e3a]/35 bg-[#0c0c12] p-5 space-y-4 shadow-[0_0_32px_rgba(196,30,58,0.12)]">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded-full bg-[#c41e3a]/15 text-[#ff6b81] border border-[#c41e3a]/30">{result.strength}</span>
                <span className="text-[#6b6b80]">key · {result.key}</span>
                <span className="text-[#6b6b80]">{result.chars} chars</span>
              </div>
              <div>
                <div className="text-[10px] tracking-widest text-[#00e5ff] font-mono mb-1.5">// HOSTED LOADSTRING</div>
                <div className="flex gap-2">
                  <input readOnly value={result.loadstring} className="flex-1 px-3 py-2.5 rounded-xl bg-black border border-[#1a1a24] text-xs font-mono text-[#c8f0f8]" />
                  <button type="button" onClick={() => copy(result.loadstring, "host")} className="px-4 py-2 rounded-xl border border-[#00e5ff]/40 text-[#00e5ff] text-xs hover:bg-[#00e5ff]/10 transition">
                    {copied === "host" ? "copied" : "copy"}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono mb-1.5">// OFFLINE BOOTSTRAP</div>
                <textarea readOnly value={result.offlineLoadstring} rows={6} className="w-full px-3 py-2.5 rounded-xl bg-black border border-[#1a1a24] text-[11px] font-mono text-[#e0c0c8] mb-2" />
                <button type="button" onClick={() => copy(result.offlineLoadstring, "off")} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#a01830] text-white text-xs font-medium hover:opacity-95 transition">
                  {copied === "off" ? "copied" : "copy offline"}
                </button>
              </div>
              <p className="text-[11px] text-[#6b6b80]">Manage / view source: open the API URL in browser → enter script password.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1a1a24] bg-[#0a0a10] p-4 space-y-4">
            <div>
              <div className="text-[10px] tracking-widest text-[#6b6b80] font-mono mb-2">// MODE</div>
              <div className="space-y-1.5">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setStrength(m.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition ${
                      strength === m.id
                        ? "border-[#c41e3a]/60 bg-[#c41e3a]/10 shadow-[0_0_16px_rgba(196,30,58,0.15)]"
                        : "border-[#1a1a24] hover:border-[#2a2a38] bg-[#08080e]"
                    }`}
                  >
                    <div className={`text-sm font-medium ${strength === m.id ? "text-[#ff6b81]" : "text-[#e0e0ec]"}`}>{m.label}</div>
                    <div className="text-[10px] text-[#6b6b80] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono mb-1.5">// SCRIPT PASSWORD</div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="5–20 chars"
                  maxLength={20}
                  className="w-full px-3 py-2.5 pr-14 rounded-xl bg-black border border-[#1a1a24] text-sm font-mono focus:outline-none focus:border-[#c41e3a]/50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#6b6b80]">
                  {showPw ? "hide" : "show"}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-widest text-[#6b6b80] font-mono mb-1.5">// CUSTOM PATH</div>
              <input
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="optional"
                maxLength={20}
                className="w-full px-3 py-2.5 rounded-xl bg-black border border-[#1a1a24] text-sm font-mono focus:outline-none focus:border-[#00e5ff]/40"
              />
            </div>

            <button
              type="button"
              disabled={loading || !source.trim()}
              onClick={protect}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c41e3a] via-[#e83a5c] to-[#c41e3a] text-white text-sm font-semibold shadow-[0_0_28px_rgba(196,30,58,0.4)] hover:shadow-[0_0_36px_rgba(196,30,58,0.55)] disabled:opacity-40 disabled:cursor-not-allowed transition hover:scale-[1.01] active:scale-[0.98]"
            >
              {loading ? "Protecting…" : "Protect · Generate loadstring"}
            </button>
          </div>

          <div className="rounded-2xl border border-[#1a1a24] bg-[#08080e] p-4 text-[11px] text-[#7a7a90] leading-relaxed space-y-2">
            <div className="text-[#c41e3a] font-mono text-[10px] tracking-widest">// TIP</div>
            <p>IRVM is default. Hosted loadstring hits /api/KEY. Offline bootstrap HttpGets /exec then runs IRVM payload.</p>
            <p>Script password gates browser view + webhook IP on unlock. Keep API key safe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
