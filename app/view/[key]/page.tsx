"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function ViewScriptPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const key = String(params.key || "");
  const t = search.get("t") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pastefyUrl, setPastefyUrl] = useState<string | null>(null);
  const [hosting, setHosting] = useState(false);
  const [hostMsg, setHostMsg] = useState("");

  useEffect(() => {
    if (!revealed) return;
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [revealed, countdown, router]);

  async function unlock() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/view/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "denied");
      setSource(data.source || "");
      setRevealed(true);
      setCountdown(30);
    } catch (e: any) {
      setError(e.message || "need key");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!source) return;
    navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = source;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function downloadCode() {
    if (!source) return;
    const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emorce_${key || "script"}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function hostPastefy() {
    if (!source || hosting) return;
    setHosting(true);
    setHostMsg("");
    setPastefyUrl(null);
    try {
      const res = await fetch("https://pastefy.app/api/v2/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          type: "PASTE",
          title: `emorce_${key}`,
          content: source,
          visibility: "UNLISTED",
          encrypted: false,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.paste?.id) {
        throw new Error(data?.error || "pastefy failed");
      }
      const id = data.paste.id;
      const raw = data.paste.raw_url || `https://pastefy.app/${id}/raw`;
      setPastefyUrl(raw);
      setHostMsg("hosted");
      try {
        await navigator.clipboard.writeText(raw);
      } catch {}
    } catch (e: any) {
      setHostMsg(e.message || "host failed");
    } finally {
      setHosting(false);
    }
  }

  if (revealed && source !== null) {
    return (
      <div className="min-h-screen bg-[#050508] text-[#e8e8f0] p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-green-400 font-mono">
              // SCRIPT UNLOCKED · returning in {countdown}s
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-xs text-[#9a9ab0] border border-[#1a1a24] px-3 py-1.5 rounded-lg hover:border-[#c41e3a]/50"
            >
              dashboard now
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCode}
              className="text-xs px-3 py-1.5 rounded-lg border border-green-800/50 bg-green-950/40 text-green-300 hover:border-green-500/60"
            >
              {copied ? "copied" : "copy code"}
            </button>
            <button
              type="button"
              onClick={downloadCode}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#3a2030] bg-[#12080c] text-[#e8c0c4] hover:border-[#c41e3a]/60"
            >
              download .lua
            </button>
            <button
              type="button"
              disabled={hosting}
              onClick={hostPastefy}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a40] bg-[#0c0c16] text-[#a0a0c0] hover:border-[#00e5ff]/40 disabled:opacity-50"
            >
              {hosting ? "hosting…" : "host on pastefy"}
            </button>
            {pastefyUrl && (
              <a
                href={pastefyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg border border-[#1a3a3a] bg-[#061212] text-[#00e5ff] hover:underline max-w-[220px] truncate"
              >
                {pastefyUrl.replace("https://", "")}
              </a>
            )}
            {hostMsg && !pastefyUrl && (
              <span className="text-xs text-red-400 font-mono self-center">{hostMsg}</span>
            )}
            {hostMsg === "hosted" && pastefyUrl && (
              <span className="text-xs text-green-500 font-mono self-center">raw url copied</span>
            )}
          </div>

          <div className="rounded-xl border border-green-900/40 bg-[#0c0c12] overflow-hidden animate-[fadeIn_0.6s_ease]">
            <div className="px-4 py-2 border-b border-[#1a1a24] text-[10px] text-[#6b6b80] font-mono tracking-widest flex justify-between">
              <span>// SOURCE · {key}</span>
              <span className="text-[#4a4a5a]">{source.length} chars</span>
            </div>
            <pre className="p-4 text-xs font-mono text-green-300 whitespace-pre-wrap max-h-[70vh] overflow-auto">
              {source}
            </pre>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-[#e8e8f0] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-[#c41e3a] font-bold text-lg">EmorceHub</div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mt-1">
            // ENTER KEY TO VIEW SOURCE
          </div>
        </div>
        <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5 space-y-3">
          <div className="text-[10px] text-[#6b6b80] font-mono tracking-widest">// MANAGE PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="enter key..."
            className="w-full px-3 py-2.5 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm font-mono focus:outline-none focus:border-[#c41e3a]/50"
          />
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button
            type="button"
            disabled={loading || !password}
            onClick={unlock}
            className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "verifying..." : "Unlock"}
          </button>
        </div>
        <p className="text-[11px] text-center text-[#4a4a5a]">
          Wrong key is logged. Access is temporary.
        </p>
      </div>
    </div>
  );
}
