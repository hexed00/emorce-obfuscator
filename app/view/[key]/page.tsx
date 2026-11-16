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
  const [countdown, setCountdown] = useState(10);
  const [revealed, setRevealed] = useState(false);

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
      setCountdown(10);
    } catch (e: any) {
      setError(e.message || "need key");
    } finally {
      setLoading(false);
    }
  }

  if (revealed && source !== null) {
    return (
      <div className="min-h-screen bg-[#050508] text-[#e8e8f0] p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-400 font-mono">
              // SCRIPT UNLOCKED · returning in {countdown}s
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-xs text-[#9a9ab0] border border-[#1a1a24] px-3 py-1.5 rounded-lg"
            >
              dashboard now
            </button>
          </div>
          <div className="rounded-xl border border-green-900/40 bg-[#0c0c12] overflow-hidden">
            <div className="px-4 py-2 border-b border-[#1a1a24] text-[10px] text-[#6b6b80] font-mono tracking-widest">
              // SOURCE · {key}
            </div>
            <pre className="p-4 text-xs font-mono text-green-300 whitespace-pre-wrap max-h-[70vh] overflow-auto">
              {source}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-[#e8e8f0] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-[#00e5ff] font-bold text-lg">EmorceHub</div>
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
        <p className="text-[11px] text-center text-[#4a4a5a]">Wrong key is logged. Access is temporary.</p>
      </div>
    </div>
  );
}
