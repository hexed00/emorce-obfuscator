"use client";

import { useEffect, useState } from "react";

type S = { key: string; strength: string; createdAt: number };

export default function KeysPage() {
  const [scripts, setScripts] = useState<S[]>([]);
  const [selected, setSelected] = useState("");
  const [localKey, setLocalKey] = useState("demorce22");
  const [invite, setInvite] = useState("https://discord.gg/emorce");
  const [snippet, setSnippet] = useState("");

  useEffect(() => {
    const key = localStorage.getItem("emorce_api_key") || "";
    if (!key) return;
    let local: S[] = [];
    try {
      local = JSON.parse(localStorage.getItem("emorce_scripts_" + key.slice(0, 24)) || "[]");
    } catch {}
    fetch("/api/me/scripts", { headers: { "x-emorce-key": key } })
      .then((r) => r.json())
      .then((d) => {
        const server = Array.isArray(d.scripts) ? d.scripts : [];
        const map = new Map<string, S>();
        for (const s of [...server, ...local]) {
          if (s?.key) map.set(s.key, s);
        }
        setScripts(Array.from(map.values()));
      })
      .catch(() => setScripts(local));
  }, []);

  function generate() {
    const s =
      `-- EmorceHub Key System · ${selected || "script"}\n` +
      `local KEY_FLAG = "EmorceHub_KeyUnlocked"\n` +
      `if not getgenv()[KEY_FLAG] then\n` +
      `  local LP = game:GetService("Players").LocalPlayer\n` +
      `  local sg = Instance.new("ScreenGui")\n` +
      `  sg.Name = "EmorceHubKey"\n` +
      `  sg.ResetOnSpawn = false\n` +
      `  pcall(function() sg.Parent = game:GetService("CoreGui") end)\n` +
      `  if not sg.Parent then sg.Parent = LP:WaitForChild("PlayerGui") end\n` +
      `  local f = Instance.new("Frame")\n` +
      `  f.Size = UDim2.new(0, 320, 0, 180)\n` +
      `  f.Position = UDim2.new(0.5, -160, 0.5, -90)\n` +
      `  f.BackgroundColor3 = Color3.fromRGB(12, 12, 18)\n` +
      `  f.BorderSizePixel = 0\n` +
      `  f.Parent = sg\n` +
      `  Instance.new("UICorner", f).CornerRadius = UDim.new(0, 10)\n` +
      `  local t = Instance.new("TextLabel")\n` +
      `  t.Size = UDim2.new(1, -20, 0, 30)\n` +
      `  t.Position = UDim2.new(0, 10, 0, 12)\n` +
      `  t.BackgroundTransparency = 1\n` +
      `  t.Text = "EmorceHub · Key Required"\n` +
      `  t.TextColor3 = Color3.fromRGB(196, 30, 58)\n` +
      `  t.Font = Enum.Font.GothamBold\n` +
      `  t.TextSize = 16\n` +
      `  t.TextXAlignment = Enum.TextXAlignment.Left\n` +
      `  t.Parent = f\n` +
      `  local box = Instance.new("TextBox")\n` +
      `  box.Size = UDim2.new(1, -20, 0, 36)\n` +
      `  box.Position = UDim2.new(0, 10, 0, 50)\n` +
      `  box.BackgroundColor3 = Color3.fromRGB(5, 5, 8)\n` +
      `  box.TextColor3 = Color3.fromRGB(230, 230, 240)\n` +
      `  box.PlaceholderText = "enter key..."\n` +
      `  box.Font = Enum.Font.Gotham\n` +
      `  box.TextSize = 14\n` +
      `  box.Text = ""\n` +
      `  box.Parent = f\n` +
      `  Instance.new("UICorner", box).CornerRadius = UDim.new(0, 6)\n` +
      `  local btn = Instance.new("TextButton")\n` +
      `  btn.Size = UDim2.new(0.48, -12, 0, 34)\n` +
      `  btn.Position = UDim2.new(0, 10, 0, 100)\n` +
      `  btn.BackgroundColor3 = Color3.fromRGB(196, 30, 58)\n` +
      `  btn.Text = "Unlock"\n` +
      `  btn.TextColor3 = Color3.new(1,1,1)\n` +
      `  btn.Font = Enum.Font.GothamBold\n` +
      `  btn.TextSize = 14\n` +
      `  btn.Parent = f\n` +
      `  Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)\n` +
      `  local get = Instance.new("TextButton")\n` +
      `  get.Size = UDim2.new(0.48, -12, 0, 34)\n` +
      `  get.Position = UDim2.new(0.52, 2, 0, 100)\n` +
      `  get.BackgroundColor3 = Color3.fromRGB(30, 30, 40)\n` +
      `  get.Text = "Get Key"\n` +
      `  get.TextColor3 = Color3.fromRGB(200, 200, 210)\n` +
      `  get.Font = Enum.Font.Gotham\n` +
      `  get.TextSize = 14\n` +
      `  get.Parent = f\n` +
      `  Instance.new("UICorner", get).CornerRadius = UDim.new(0, 6)\n` +
      `  local unlocked = false\n` +
      `  local function tryUnlock(k)\n` +
      `    if k == "${localKey}" then\n` +
      `      unlocked = true\n` +
      `      getgenv()[KEY_FLAG] = true\n` +
      `      sg:Destroy()\n` +
      `    end\n` +
      `  end\n` +
      `  btn.MouseButton1Click:Connect(function() tryUnlock(box.Text) end)\n` +
      `  get.MouseButton1Click:Connect(function()\n` +
      `    pcall(function() setclipboard("${invite}") end)\n` +
      `  end)\n` +
      `  repeat task.wait() until unlocked\n` +
      `end\n`;
    setSnippet(s);
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <div className="text-[11px] text-[#00e5ff] font-mono tracking-widest">// KEY MANAGER</div>
        <h1 className="text-xl font-bold text-white mt-1">Key Manager</h1>
        <p className="text-sm text-[#9a9ab0]">
          Select a saved script, set the unlock key, generate EmorceHub key UI to prepend.
        </p>
      </div>

      <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">// SCRIPT</div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm"
            >
              <option value="">— Select a script —</option>
              {scripts.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">// INTEGRATION</div>
            <div className="px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm text-[#9a9ab0]">
              Free Key (EmorceHub)
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">// SCRIPT KEY</div>
          <input
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm font-mono"
          />
        </div>
        <div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">// GET KEY LINK</div>
          <input
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm"
          />
        </div>
        <button
          type="button"
          onClick={generate}
          className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium"
        >
          Generate Key System
        </button>
        {snippet && (
          <div>
            <div className="text-[10px] text-green-400 tracking-widest font-mono mb-1">
              // PREPEND TO SOURCE THEN RE-PROTECT
            </div>
            <textarea
              readOnly
              value={snippet}
              rows={10}
              className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-green-900/40 text-[11px] font-mono text-green-300"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(snippet)}
              className="mt-2 text-xs text-green-400 border border-green-900/40 px-3 py-1.5 rounded-lg"
            >
              copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
