"use client";

import { useEffect, useRef, useState } from "react";

const BG =
  "https://i.pinimg.com/originals/ea/93/00/ea9300f82314e363c0faa32aa5a52a43.gif";
const OWNER_PFP =
  "https://i.pinimg.com/1200x/ce/00/6c/ce006ceb951d81ad06ded1c116f75bdc.jpg";
const ICON =
  "https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg";
const MUSIC = "/site-music.mp3";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [homeKey, setHomeKey] = useState("");
  const [siteKey, setSiteKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [musicReady, setMusicReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.4;
    a.loop = true;
    const tryPlay = () => {
      a.play()
        .then(() => setMusicReady(true))
        .catch(() => {});
    };
    tryPlay();
    const onInteract = () => tryPlay();
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [loading]);

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
    if (!a.muted) a.play().catch(() => {});
  }

  function submitAccess() {
    setError("");
    const h = homeKey.trim().toLowerCase();
    const s = siteKey.trim().toLowerCase();

    const ownerOk =
      s === "demorce22" ||
      (h === "demorce22" && s === "demorce22") ||
      (h === "emorce" && s === "demorce22");

    if (ownerOk) {
      try {
        sessionStorage.setItem("emorce_site_gate", "1");
        sessionStorage.setItem("emorce_role", "owner");
      } catch {}
      window.location.href = "/login";
      return;
    }

    if (
      (h.startsWith("emorce_home_") || h === "emorce") &&
      s.startsWith("emorce_access_") &&
      s.length > 18
    ) {
      try {
        sessionStorage.setItem("emorce_site_gate", "1");
        sessionStorage.setItem("emorce_role", "user");
        sessionStorage.setItem("emorce_invite", s);
      } catch {}
      window.location.href = "/login";
      return;
    }

    if (s.startsWith("emorce_access_") && s.length > 18 && (!h || h === "emorce")) {
      try {
        sessionStorage.setItem("emorce_site_gate", "1");
        sessionStorage.setItem("emorce_role", "user");
        sessionStorage.setItem("emorce_invite", s);
      } catch {}
      window.location.href = "/login";
      return;
    }

    setError("invalid homepage key or site key");
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-[#1a0508]" />
        <img
          src={ICON}
          alt=""
          className="relative w-20 h-20 rounded-full object-cover border-2 border-[#c41e3a]/60 shadow-[0_0_40px_rgba(196,30,58,0.5)] animate-pulse"
        />
        <div className="relative text-[#c41e3a] font-mono text-sm tracking-[0.4em] uppercase drop-shadow-[0_0_12px_rgba(196,30,58,0.8)]">
          Emorce · Grave
        </div>
        <div className="relative w-48 h-[3px] bg-[#1a1a24] overflow-hidden rounded-full">
          <div className="h-full w-3/4 bg-gradient-to-r from-[#c41e3a] via-[#ff4d6d] to-[#00e5ff] animate-pulse shadow-[0_0_12px_#c41e3a]" />
        </div>
        <div className="relative text-[10px] text-[#6b6b80] tracking-[0.3em]">loading</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#e8e8f0] relative overflow-x-hidden">
      <audio ref={audioRef} src={MUSIC} preload="auto" />
      <div
        className="fixed inset-0 -z-20 scale-105"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.15) contrast(1.05)",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/55 via-[#0a0508]/70 to-black/85" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(196,30,58,0.12)_100%)]" />
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full bg-[#c41e3a]/10 blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full bg-[#00e5ff]/5 blur-3xl -z-10 animate-pulse" />

      <header className="sticky top-0 z-20 border-b border-[#c41e3a]/20 bg-black/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={ICON} alt="" className="w-8 h-8 rounded-full object-cover border border-[#c41e3a]/50" />
            <span className="font-bold tracking-tight">
              <span className="text-[#00e5ff]">Emorce</span>
              <span className="text-white">Hub</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#b0b0c0]">
            <a href="#how" className="hover:text-[#00e5ff] transition">How It Works</a>
            <a href="#features" className="hover:text-[#00e5ff] transition">Features</a>
            <a href="#pricing" className="hover:text-[#c41e3a] transition">Pricing</a>
            <a href="#support" className="hover:text-white transition">Support</a>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="hover:text-[#00e5ff]">
              Discord
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleMute} className="text-[10px] px-2.5 py-1 rounded-full border border-[#c41e3a]/30 text-[#c8c8d8] hover:border-[#c41e3a] hover:text-white">
              {muted ? "unmute" : musicReady ? "mute" : "music"}
            </button>
            <button
              type="button"
              onClick={() => setShowAccess(true)}
              className="text-sm px-4 py-1.5 rounded-full bg-gradient-to-r from-[#c41e3a] to-[#00e5ff] text-black font-semibold shadow-[0_0_20px_rgba(196,30,58,0.35)]"
            >
              Enter Access
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c41e3a]/40 bg-[#c41e3a]/10 text-[11px] text-[#ff6b81] font-mono tracking-wide shadow-[0_0_20px_rgba(196,30,58,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c41e3a] animate-pulse" />
          EMORCE · DEMON BUILD · OWNER GATED
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          Protect Your Scripts
          <br />
          <span className="bg-gradient-to-r from-[#c41e3a] via-[#ff4d6d] to-[#00e5ff] bg-clip-text text-transparent">
            From Skidders
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-[#b8b8c8] text-sm md:text-base">
          Premium Emorce obfuscator. IRVM · HEXED · Honey · Volt. Upload, lock, ship a loadstring they cannot peel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowAccess(true)}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-[#c41e3a] to-[#ff4d6d] text-white font-semibold text-sm shadow-[0_0_30px_rgba(196,30,58,0.4)] hover:opacity-95 transition"
          >
            Start Protecting
          </button>
          <a href="#pricing" className="px-6 py-3 rounded-full border border-[#00e5ff]/30 text-sm text-[#c8e8f0] hover:border-[#00e5ff] hover:text-[#00e5ff] transition">
            View Pricing
          </a>
        </div>
        <div className="pt-8 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#c41e3a]/30 bg-black/50 backdrop-blur shadow-[0_0_30px_rgba(196,30,58,0.15)]">
            <img src={OWNER_PFP} alt="owner" className="w-12 h-12 rounded-full object-cover border-2 border-[#c41e3a]/60" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">Site Owner</div>
              <div className="text-[11px] text-[#8a8a9a] font-mono">Emorce · discord.gg/emorce</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10 space-y-2">
          <div className="text-[10px] tracking-[0.25em] text-[#c41e3a] font-mono">PRICING</div>
          <h2 className="text-2xl md:text-3xl font-bold">Access tiers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-black/55 backdrop-blur p-6 space-y-4 hover:border-[#00e5ff]/40 transition shadow-lg">
            <div className="text-[10px] tracking-widest text-[#00e5ff] font-mono">WEEKLY</div>
            <div className="text-4xl font-bold">
              $5<span className="text-base text-[#6b6b80] font-normal"> / week</span>
            </div>
            <ul className="text-sm text-[#a0a0b0] space-y-2 text-left">
              <li>· All modes (IRVM / HEXED / Honey…)</li>
              <li>· Hosted + offline loadstrings</li>
              <li>· Password-gated manage page</li>
              <li>· Scripts bound to your API key</li>
            </ul>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-block w-full text-center py-2.5 rounded-xl border border-[#00e5ff]/40 text-[#00e5ff] text-sm hover:bg-[#00e5ff]/10">
              Get Weekly · Discord
            </a>
          </div>
          <div className="rounded-2xl border border-[#c41e3a]/50 bg-black/55 backdrop-blur p-6 space-y-4 shadow-[0_0_40px_rgba(196,30,58,0.2)]">
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">LIFETIME</div>
            <div className="text-4xl font-bold">
              $22<span className="text-base text-[#6b6b80] font-normal"> once</span>
            </div>
            <ul className="text-sm text-[#a0a0b0] space-y-2 text-left">
              <li>· Everything in Weekly</li>
              <li>· Lifetime site key</li>
              <li>· Priority support</li>
              <li>· Future modes included</li>
            </ul>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#00e5ff] text-black font-semibold text-sm">
              Get Lifetime · Discord
            </a>
          </div>
        </div>
        <p className="text-center text-[11px] text-[#6b6b80] mt-6 max-w-lg mx-auto">
          Two keys: homepage key + site key. Owner site key is demorce22.
        </p>
      </section>

      <section id="how" className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] tracking-[0.25em] text-[#c41e3a] font-mono">HOW IT WORKS</div>
          <h2 className="text-2xl font-bold">Four steps</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["01", "Get access", "Weekly or lifetime via Discord. Owner sends keys."],
            ["02", "Enter Access", "Homepage key + site key → login / API key."],
            ["03", "Protect", "Paste Lua, IRVM/HEXED, script password."],
            ["04", "Ship", "Hosted or offline loadstring."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-xl border border-[#c41e3a]/15 bg-black/50 p-4 text-left hover:border-[#c41e3a]/40 transition">
              <div className="text-[#c41e3a] font-mono text-xs mb-1">{n}</div>
              <div className="font-medium text-white mb-1">{t}</div>
              <div className="text-[#9a9ab0] text-xs leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="text-[10px] tracking-[0.25em] text-[#c41e3a] font-mono">FEATURES</div>
          <h2 className="text-2xl font-bold">Demon stack</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ["IRVM / HEXED", "Dual-stream cells, decoys, nested barrier."],
            ["Password view", "Browser asks for key. Scrapers get need key."],
            ["Dual keys", "Homepage key + site key. Owner and issued users."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-black/50 p-4 hover:border-[#00e5ff]/30 transition">
              <div className="font-medium text-white mb-2">{t}</div>
              <div className="text-[#9a9ab0] text-xs leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="text-center space-y-2 mb-6">
          <div className="text-[10px] tracking-[0.25em] text-[#c41e3a] font-mono">SUPPORT</div>
          <h2 className="text-2xl font-bold">Help</h2>
        </div>
        {[
          {
            id: "keys",
            q: "Homepage key vs site key?",
            a: "Homepage key is outer (owner: demorce22 / emorce). Site key is demorce22 for owner or issued emorce_access_… for users.",
          },
          {
            id: "buy",
            q: "How do I buy?",
            a: "discord.gg/emorce · ticket · $5 weekly or $22 lifetime. Owner issues keys.",
          },
          {
            id: "owner",
            q: "Site owner access?",
            a: "Site key demorce22 (homepage key demorce22 or emorce). Never share owner key.",
          },
          {
            id: "modes",
            q: "Strongest mode?",
            a: "IRVM then HEXED. App default is IRVM.",
          },
        ].map((item) => {
          const open = openFaq === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-[#c41e3a]/20 bg-black/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(open ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-[#c41e3a]/10"
              >
                <span>{item.q}</span>
                <span className={`text-[#c41e3a] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
              </button>
              <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
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

      <footer className="border-t border-[#c41e3a]/15 py-8 text-center text-[11px] text-[#5a5a6a]">
        EmorceHub · demon build · not affiliated with Roblox
      </footer>

      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border border-[#c41e3a]/40 bg-[#0a0608] shadow-[0_0_50px_rgba(196,30,58,0.25)] ${shake ? "animate-pulse" : ""}`}>
            <div className="px-5 pt-5 pb-3 border-b border-[#c41e3a]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={ICON} alt="" className="w-9 h-9 rounded-full object-cover border border-[#c41e3a]/50" />
                <div>
                  <div className="text-sm font-bold">Enter Access</div>
                  <div className="text-[10px] text-[#6b6b80] font-mono">homepage key + site key</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowAccess(false)} className="text-[#6b6b80] hover:text-white text-lg leading-none">
                ×
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="text-[10px] text-[#c41e3a] tracking-widest font-mono mb-1.5">// HOMEPAGE KEY</div>
                <input
                  type="password"
                  value={homeKey}
                  onChange={(e) => setHomeKey(e.target.value)}
                  placeholder="homepage key"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-sm font-mono text-center focus:outline-none focus:border-[#c41e3a]/60"
                />
              </div>
              <div>
                <div className="text-[10px] text-[#00e5ff] tracking-widest font-mono mb-1.5">// SITE KEY</div>
                <input
                  type="password"
                  value={siteKey}
                  onChange={(e) => setSiteKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAccess()}
                  placeholder="site / access key"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-sm font-mono text-center focus:outline-none focus:border-[#00e5ff]/50"
                />
              </div>
              {error && <div className="text-center text-sm text-red-400 font-mono">{error}</div>}
              <button
                type="button"
                onClick={submitAccess}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#a01830] text-white text-sm font-semibold shadow-[0_0_20px_rgba(196,30,58,0.35)]"
              >
                Unlock
              </button>
              <p className="text-[10px] text-center text-[#5a5a6a]">
                Owner site key <span className="text-[#c41e3a]">demorce22</span> · users: issued keys
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
