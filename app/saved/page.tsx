"use client";

import { useEffect, useState } from "react";

type S = {
  id: string;
  key: string;
  strength: string;
  chars: number;
  createdAt: number;
  customPath: string | null;
};

export default function SavedPage() {
  const [scripts, setScripts] = useState<S[]>([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function loadstringFor(key: string) {
    const host =
      typeof window !== "undefined"
        ? window.location.host
        : "emorce-obfuscator.vercel.app";
    return `loadstring(game:HttpGet("https://${host}/api/${key}"))()`;
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  useEffect(() => {
    const apiKey = localStorage.getItem("emorce_api_key") || "";
    if (!apiKey) {
      setErr("no api key — log in again");
      return;
    }

    let local: S[] = [];
    try {
      const listKey = "emorce_scripts_" + apiKey.slice(0, 24);
      local = JSON.parse(localStorage.getItem(listKey) || "[]");
    } catch {
      local = [];
    }

    fetch("/api/me/scripts", {
      headers: { "x-emorce-key": apiKey },
    })
      .then((r) => r.json())
      .then((d) => {
        const server: S[] = Array.isArray(d.scripts) ? d.scripts : [];
        if (d.name) setName(d.name);
        const map = new Map<string, S>();
        for (const s of [...server, ...local]) {
          if (!s?.key) continue;
          const prev = map.get(s.key);
          if (!prev || (s.createdAt || 0) >= (prev.createdAt || 0)) map.set(s.key, s);
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );
        setScripts(merged);
        try {
          const listKey = "emorce_scripts_" + apiKey.slice(0, 24);
          localStorage.setItem(listKey, JSON.stringify(merged));
        } catch {}
        if (d.error && merged.length === 0) setErr(d.error);
        else setErr("");
      })
      .catch(() => {
        setScripts(local);
        if (!local.length) setErr("could not reach server");
      });
  }, []);

  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div>
        <div className="text-[11px] text-[#00e5ff] font-mono tracking-widest">// SAVED SCRIPTS</div>
        <h1 className="text-xl font-bold text-white mt-1">My Scripts</h1>
        <p className="text-sm text-[#9a9ab0]">
          Bound to your API key{name ? ` · ${name}` : ""}. Open View → enter manage password to see source.
        </p>
      </div>

      {err && <div className="text-sm text-red-400">{err}</div>}
      {!err && scripts.length === 0 && (
        <p className="text-sm text-[#6b6b80]">
          No scripts yet. Protect one on Obfuscator while logged in — it will appear here.
        </p>
      )}

      <div className="space-y-3">
        {scripts.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-[#1a2a30] bg-[#0a0e14] px-4 py-3 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[#00e5ff]">🔒</span>
                <span className="text-sm font-mono text-[#00e5ff] truncate">{s.key}</span>
              </div>
              <div className="text-[11px] text-[#6b6b80] mt-1">
                {new Date(s.createdAt).toLocaleString()} · {s.strength} · {s.chars} chars
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy(loadstringFor(s.key), s.key)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#1a3a40] text-[#00e5ff] hover:bg-[#0e2a30]"
              >
                {copied === s.key ? "copied" : "Copy loadstring"}
              </button>
              <a
                href={`/script/${s.key}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#1a3a40] text-[#9a9ab0] hover:text-white"
              >
                View
              </a>
              <a
                href={`/script/${s.key}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-yellow-700/50 text-yellow-400"
              >
                Edit
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
