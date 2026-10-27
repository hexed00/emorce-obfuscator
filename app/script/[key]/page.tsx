"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ManageScript() {
  const params = useParams();
  const key = String(params.key || "");

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [source, setSource] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [meta, setMeta] = useState<{ id: string; chars: number; customPath: string | null } | null>(null);

  async function unlock() {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`/api/script/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSource(data.source);
      setMeta({ id: data.id, chars: data.chars, customPath: data.customPath });
      setUnlocked(true);
    } catch (e: any) {
      setError(e.message || "Wrong password");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`/api/script/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "update", source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Saved. Loadstring still points to the same URL.");
      if (meta) setMeta({ ...meta, chars: data.chars });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this script forever? The loadstring will stop working.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/script/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "delete" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUnlocked(false);
      setSource("");
      setMsg("Deleted.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([source], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta?.customPath || meta?.id || "script"}.lua`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col text-[#e8e8f0]">
      <header className="border-b border-[#1a1a24] bg-[#08080e] px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-[#6b6b80] hover:text-white text-sm">← back</Link>
        <span className="font-semibold text-sm text-[#c41e3a]">EmorceHub</span>
        <span className="text-[#6b6b80] font-mono text-xs">/ script / {key}</span>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {!unlocked ? (
          <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-6 space-y-5 mt-8">
            <h1 className="font-medium text-[#c41e3a]">Password required</h1>
            <p className="text-sm text-[#9a9ab0]">
              Enter the password you set when you protected the script to view, edit, download or delete the source.
              The public loadstring does not need this password.
            </p>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlock()}
                placeholder="Password…"
                className="w-full px-4 py-2.5 pr-16 rounded-lg border border-[#1a1a24] bg-[#050508] text-sm focus:outline-none focus:border-[#c41e3a]/50"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b6b80]">
                {showPw ? "hide" : "show"}
              </button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {msg && <p className="text-sm text-green-400">{msg}</p>}
            <button
              type="button"
              onClick={unlock}
              disabled={loading || !password}
              className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Checking…" : "Unlock"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="text-xs text-[#6b6b80] font-mono">
                id: {meta?.id} · {meta?.chars} chars
                {meta?.customPath ? ` · path: ${meta.customPath}` : ""}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={download} className="px-3 py-1.5 rounded-lg border border-[#1a1a24] text-xs text-[#9a9ab0] hover:text-white">Download</button>
                <button type="button" onClick={save} disabled={loading} className="px-3 py-1.5 rounded-lg bg-[#c41e3a] text-xs text-white disabled:opacity-50">Save</button>
                <button type="button" onClick={remove} disabled={loading} className="px-3 py-1.5 rounded-lg border border-red-900/50 text-xs text-red-400">Delete</button>
              </div>
            </div>
            {msg && <p className="text-sm text-green-400">{msg}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[400px] px-4 py-3 rounded-xl border border-[#1a1a24] bg-[#050508] text-sm font-mono text-[#b8b8c8] focus:outline-none focus:border-[#c41e3a]/40"
            />
          </div>
        )}
      </main>
    </div>
  );
}
