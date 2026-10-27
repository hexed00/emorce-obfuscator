"use client";

import { useState } from "react";

export default function KeysPage() {
  const [localKey, setLocalKey] = useState("demorce22");
  const [invite, setInvite] = useState("https://discord.gg/emorce");
  const [snippet, setSnippet] = useState("");

  function generate() {
    const s = `-- EmorceHub Key System
local KEY_FLAG = "EmorceHub_KeyUnlocked"
if not getgenv()[KEY_FLAG] then
  local LP = game:GetService("Players").LocalPlayer
  local sg = Instance.new("ScreenGui")
  sg.Name = "EmorceHubKey"
  sg.ResetOnSpawn = false
  pcall(function() sg.Parent = game:GetService("CoreGui") end)
  if not sg.Parent then sg.Parent = LP:WaitForChild("PlayerGui") end
  local f = Instance.new("Frame")
  f.Size = UDim2.new(0, 320, 0, 180)
  f.Position = UDim2.new(0.5, -160, 0.5, -90)
  f.BackgroundColor3 = Color3.fromRGB(12, 12, 18)
  f.BorderSizePixel = 0
  f.Parent = sg
  Instance.new("UICorner", f).CornerRadius = UDim.new(0, 10)
  local t = Instance.new("TextLabel")
  t.Size = UDim2.new(1, -20, 0, 30)
  t.Position = UDim2.new(0, 10, 0, 12)
  t.BackgroundTransparency = 1
  t.Text = "EmorceHub · Key Required"
  t.TextColor3 = Color3.fromRGB(196, 30, 58)
  t.Font = Enum.Font.GothamBold
  t.TextSize = 16
  t.TextXAlignment = Enum.TextXAlignment.Left
  t.Parent = f
  local box = Instance.new("TextBox")
  box.Size = UDim2.new(1, -20, 0, 36)
  box.Position = UDim2.new(0, 10, 0, 50)
  box.BackgroundColor3 = Color3.fromRGB(5, 5, 8)
  box.TextColor3 = Color3.fromRGB(230, 230, 240)
  box.PlaceholderText = "enter key..."
  box.Font = Enum.Font.Gotham
  box.TextSize = 14
  box.Text = ""
  box.Parent = f
  Instance.new("UICorner", box).CornerRadius = UDim.new(0, 6)
  local btn = Instance.new("TextButton")
  btn.Size = UDim2.new(0.48, -12, 0, 34)
  btn.Position = UDim2.new(0, 10, 0, 100)
  btn.BackgroundColor3 = Color3.fromRGB(196, 30, 58)
  btn.Text = "Unlock"
  btn.TextColor3 = Color3.new(1,1,1)
  btn.Font = Enum.Font.GothamBold
  btn.TextSize = 14
  btn.Parent = f
  Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)
  local get = Instance.new("TextButton")
  get.Size = UDim2.new(0.48, -12, 0, 34)
  get.Position = UDim2.new(0.52, 2, 0, 100)
  get.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
  get.Text = "Get Key"
  get.TextColor3 = Color3.fromRGB(200, 200, 210)
  get.Font = Enum.Font.Gotham
  get.TextSize = 14
  get.Parent = f
  Instance.new("UICorner", get).CornerRadius = UDim.new(0, 6)
  local unlocked = false
  local function tryUnlock(k)
    if k == "${localKey}" then
      unlocked = true
      getgenv()[KEY_FLAG] = true
      sg:Destroy()
    end
  end
  btn.MouseButton1Click:Connect(function() tryUnlock(box.Text) end)
  get.MouseButton1Click:Connect(function()
    pcall(function() setclipboard("${invite}") end)
  end)
  repeat task.wait() until unlocked
end
`;
    setSnippet(s);
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Key Manager</h1>
        <p className="text-sm text-[#9a9ab0]">Generate EmorceHub key system and paste it above your script before protecting.</p>
      </div>
      <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5 space-y-4">
        <div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">// SCRIPT KEY</div>
          <input value={localKey} onChange={(e) => setLocalKey(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm font-mono" />
        </div>
        <div>
          <div className="text-[10px] text-[#6b6b80] tracking-widest font-mono mb-1">// GET KEY LINK</div>
          <input value={invite} onChange={(e) => setInvite(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-[#1a1a24] text-sm" />
        </div>
        <button type="button" onClick={generate} className="w-full py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium">Generate Key System</button>
        {snippet && (
          <div>
            <div className="text-[10px] text-green-400 tracking-widest font-mono mb-1">// PREPEND TO SCRIPT THEN PROTECT</div>
            <textarea readOnly value={snippet} rows={12} className="w-full px-3 py-2 rounded-lg bg-[#050508] border border-green-900/40 text-[11px] font-mono text-green-300" />
            <button type="button" onClick={() => navigator.clipboard.writeText(snippet)} className="mt-2 text-xs text-green-400 border border-green-900/40 px-3 py-1.5 rounded-lg">copy</button>
          </div>
        )}
      </div>
    </div>
  );
}
