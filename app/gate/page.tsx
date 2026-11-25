"use client";

import { useEffect, useRef, useState } from "react";

const BG =
  "https://i.pinimg.com/originals/ea/93/00/ea9300f82314e363c0faa32aa5a52a43.gif";
const OWNER_PFP =
  "https://i.pinimg.com/1200x/ce/00/6c/ce006ceb951d81ad06ded1c116f75bdc.jpg";
const ICON =
  "https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg";

export default function GatePage() {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;
    a.loop = true;
    const play = () => {
      a.play().catch(() => {});
    };
    play();
    const onInteract = () => play();
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [loading]);

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }

  function submitAccess() {
    setError("");
    const v = key.trim().toLowerCase();
    if (v === "demorce22") {
      try {
        sessionStorage.setItem("emorce_site_gate", "1");
        sessionStorage.setItem("emorce_role", "owner");
      } catch {}
      window.location.href = "/login";
      return;
    }
    if (v.startsWith("emorce_access_") && v.length > 18) {
      try {
        sessionStorage.setItem("emorce_site_gate", "1");
        sessionStorage.setItem("emorce_role", "user");
        sessionStorage.setItem("emorce_invite", v);
      } catch {}
      window.location.href = "/login";
      return;
    }
    setError("invalid access key");
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <img src={ICON} alt="" className="w-16 h-16 rounded-full object-cover opacity-90 animate-pulse" />
        <div className="text-[#c41e3a] font-mono text-sm tracking-[0.35em] uppercase">
          Emorce · Grave
        </div>
        <div className="w-40 h-[2px] bg-[#1a1a24] overflow-hidden rounded">
          <div className="h-full bg-gradient-to-r from-[#c41e3a] to-[#00e5ff] animate-pulse w-2/3" />
        </div>
        <div className="text-[10px] text-[#4a4a5a] tracking-widest">loading</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#e8e8f0] relative overflow-x-hidden">
      <audio ref={audioRef} src="/site-music.mp3" preload="auto" />
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/75" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_#050508_70%)]" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={ICON} alt="" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold tracking-tight">
              <span className="text-[#00e5ff]">Emorce</span>
              <span className="text-white">Hub</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#9a9ab0]">
            <a href="#how" className="hover:text-white transition">How It Works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#support" className="hover:text-white transition">Support</a>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="hover:text-[#00e5ff] transition">
              Discord
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleMute} className="text-[10px] px-2 py-1 rounded border border-white/10 text-[#9a9ab0] hover:text-white">
              {muted ? "unmute" : "mute"}
            </button>
            <button
              type="button"
              onClick={() => setShowAccess(true)}
              className="text-sm px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#c41e3a] text-black font-semibold"
            >
              Enter Access
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/5 text-[11px] text-[#00e5ff] font-mono tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
          EMORCE SCRIPT PROTECTION · OWNER GATED
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Protect Your Scripts
          <br />
          <span className="bg-gradient-to-r from-[#00e5ff] via-white to-[#c41e3a] bg-clip-text text-transparent">
            From Skidders
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-[#9a9ab0] text-sm md:text-base">
          Emorce obfuscator for Roblox. Upload, set a password, get a secure loadstring.
          IRVM · HEXED · Honey · Volt. Stop copy-paste theft.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowAccess(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#c41e3a] text-black font-semibold text-sm shadow-lg shadow-[#00e5ff]/10"
          >
            Start Protecting
          </button>
          <a href="#how" className="px-6 py-3 rounded-full border border-white/15 text-sm text-[#c8c8d8] hover:border-white/30">
            See How It Works
          </a>
        </div>
        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur">
            <img src={OWNER_PFP} alt="owner" className="w-12 h-12 rounded-full object-cover border border-[#c41e3a]/50" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">Site Owner</div>
              <div className="text-[11px] text-[#6b6b80] font-mono">Emorce · discord.gg/emorce</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10 space-y-2">
          <div className="text-[10px] tracking-[0.25em] text-[#6b6b80] font-mono">PRICING</div>
          <h2 className="text-2xl md:text-3xl font-bold">Access tiers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur p-6 space-y-4 hover:border-[#00e5ff]/40 transition">
            <div className="text-[10px] tracking-widest text-[#00e5ff] font-mono">WEEKLY</div>
            <div className="text-4xl font-bold">
              $5<span className="text-base text-[#6b6b80] font-normal"> / week</span>
            </div>
            <ul className="text-sm text-[#9a9ab0] space-y-2">
              <li>· Full obfuscator modes (IRVM / HEXED / Honey…)</li>
              <li>· Hosted + offline loadstrings</li>
              <li>· Password-gated script view</li>
              <li>· Saved scripts under your API key</li>
            </ul>
            <p className="text-[11px] text-[#5a5a6a]">Buy via Discord · owner issues your access key</p>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-block w-full text-center py-2.5 rounded-xl border border-[#00e5ff]/40 text-[#00e5ff] text-sm hover:bg-[#00e5ff]/10">
              Get Weekly on Discord
            </a>
          </div>
          <div className="rounded-2xl border border-[#c41e3a]/40 bg-black/50 backdrop-blur p-6 space-y-4 shadow-[0_0_40px_rgba(196,30,58,0.12)] hover:border-[#c41e3a]/70 transition">
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">LIFETIME</div>
            <div className="text-4xl font-bold">
              $22<span className="text-base text-[#6b6b80] font-normal"> once</span>
            </div>
            <ul className="text-sm text-[#9a9ab0] space-y-2">
              <li>· Everything in Weekly</li>
              <li>· Lifetime access key</li>
              <li>· Priority support</li>
              <li>· Future modes included</li>
            </ul>
            <p className="text-[11px] text-[#5a5a6a]">Site owner access is separate · demorce22 never shared</p>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#00e5ff] text-black font-semibold text-sm">
              Get Lifetime on Discord
            </a>
          </div>
        </div>
        <p className="text-center text-[11px] text-[#5a5a6a] mt-6 max-w-lg mx-auto">
          After payment, owner issues a personal access key. That key unlocks login/signup and API key for scripts.
        </p>
      </section>

      <section id="how" className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] tracking-[0.25em] text-[#6b6b80] font-mono">HOW IT WORKS</div>
          <h2 className="text-2xl font-bold">Four steps</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["01", "Get access", "Weekly or lifetime via Discord. Owner sends your key."],
            ["02", "Enter Access", "Paste key here → login / generate API key."],
            ["03", "Protect", "Paste Lua, pick IRVM/HEXED, set script password."],
            ["04", "Ship", "Copy hosted or offline loadstring."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-xl border border-white/10 bg-black/40 p-4 text-left">
              <div className="text-[#00e5ff] font-mono text-xs mb-1">{n}</div>
              <div className="font-medium text-white mb-1">{t}</div>
              <div className="text-[#9a9ab0] text-xs leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="text-[10px] tracking-[0.25em] text-[#6b6b80] font-mono">FEATURES</div>
          <h2 className="text-2xl font-bold">Built different</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ["IRVM / HEXED", "Dual-stream cells, decoys, nested barrier."],
            ["Password view", "API link in browser asks for key. Scrapers get need key."],
            ["Owner gate", "Site owner access + issued user keys."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="font-medium text-white mb-2">{t}</div>
              <div className="text-[#9a9ab0] text-xs leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="text-center space-y-2 mb-6">
          <div className="text-[10px] tracking-[0.25em] text-[#6b6b80] font-mono">SUPPORT</div>
          <h2 className="text-2xl font-bold">Help</h2>
        </div>
        {[
          {
            id: "buy",
            q: "How do I buy access?",
            a: "Open discord.gg/emorce, ticket, pay weekly ($5) or lifetime ($22). Owner sends your access key.",
          },
          {
            id: "owner",
            q: "What is site owner access?",
            a: "Owner key (demorce22) unlocks full login/signup. Users get issued access keys only.",
          },
          {
            id: "api",
            q: "API key vs access key?",
            a: "Access key opens the site. Then you generate/login with an API key that owns your scripts.",
          },
          {
            id: "modes",
            q: "Which mode is strongest?",
            a: "IRVM then HEXED. Honey/Volt add anti-tamper. Use IRVM for public loadstrings.",
          },
        ].map((item) => {
          const open = openFaq === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-white/10 bg-black/40 overflow-hidden transition">
              <button
                type="button"
                onClick={() => setOpenFaq(open ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-white/5"
              >
                <span>{item.q}</span>
                <span className={`text-[#6b6b80] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
              </button>
              <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-xs text-[#9a9ab0] leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="text-center pt-4">
          <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="text-sm text-[#00e5ff] hover:underline">
            discord.gg/emorce · support
          </a>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-[11px] text-[#4a4a5a]">
        EmorceHub · script protection · not affiliated with Roblox
      </footer>

      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border border-[#c41e3a]/35 bg-[#0a0a10] shadow-2xl ${shake ? "animate-pulse" : ""}`}>
            <div className="px-5 pt-5 pb-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={ICON} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-bold">Enter Access</div>
                  <div className="text-[10px] text-[#6b6b80] font-mono">owner or issued key</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowAccess(false)} className="text-[#6b6b80] hover:text-white text-lg leading-none">
                ×
              </button>
            </div>
            <div className="p-5 space-y-3">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitAccess()}
                placeholder="access key"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm font-mono text-center focus:outline-none focus:border-[#c41e3a]/60"
              />
              {error && <div className="text-center text-sm text-red-400 font-mono">{error}</div>}
              <button type="button" onClick={submitAccess} className="w-full py-3 rounded-xl bg-[#c41e3a] text-white text-sm font-semibold">
                Unlock
              </button>
              <p className="text-[10px] text-center text-[#5a5a6a]">
                Site owner · demorce22 · users use issued keys from Discord
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
