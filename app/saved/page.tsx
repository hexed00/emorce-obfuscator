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

  useEffect(() => {
    const key = localStorage.getItem("emorce_api_key") || "";
    if (!key) {
      setErr("no api key in session");
      return;
    }
    fetch("/api/me/scripts", {
      headers: { "x-emorce-key": key },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else {
          setScripts(d.scripts || []);
          setName(d.name || "");
        }
      })
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Saved Scripts</h1>
        <p className="text-sm text-[#9a9ab0]">
          Bound to your API key{name ? ` · ${name}` : ""}. Login required each visit.
        </p>
      </div>
      {err && <div className="text-sm text-red-400">{err}</div>}
      {!err && scripts.length === 0 && (
        <p className="text-sm text-[#6b6b80]">No scripts yet. Protect one on Obfuscator while logged in.</p>
      )}
      <div className="space-y-2">
        {scripts.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] px-4 py-3 flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-mono text-[#00e5ff]">{s.key}</div>
              <div className="text-[11px] text-[#6b6b80]">
                {s.strength} · {s.chars} chars · {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            <a
              href={`/script/${s.key}`}
              className="text-xs text-[#c41e3a] border border-[#c41e3a]/40 px-3 py-1.5 rounded-lg"
            >
              manage
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
