"use client";

import { useEffect, useRef, useState } from "react";

const BG =
  "https://i.pinimg.com/originals/ea/93/00/ea9300f82314e363c0faa32aa5a52a43.gif";
const OWNER_PFP =
  "https://i.pinimg.com/1200x/ce/00/6c/ce006ceb951d81ad06ded1c116f75bdc.jpg";
const ICON =
  "https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg";
// API-served audio (base64 modules) — reliable on Vercel
const MUSIC = "/api/music";
const CLICK = "/api/click";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [loadPct, setLoadPct] = useState(0);
  const [homeKey, setHomeKey] = useState("");
  const [siteKey, setSiteKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);

  // Grave loading with progress
  useEffect(() => {
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(tick);
        setTimeout(() => setLoading(false), 280);
      }
      setLoadPct(Math.min(100, Math.floor(p)));
    }, 120);
    return () => clearInterval(tick);
  }, []);

  // Music after load — autoplay + first interaction unlock
  useEffect(() => {
    if (loading) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.38;
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

  function playClick() {
    try {
      const c = new Audio(CLICK);
      c.volume = 0.32;
      c.play().catch(() => {});
    } catch {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.04;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        o.stop(ctx.currentTime + 0.07);
      } catch {}
    }
  }

  function press(id: string) {
    setPressed(id);
    playClick();
    setTimeout(() => setPressed(null), 160);
  }

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
      <div className="min-h-screen bg-[#050305] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url(${BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(1.2) contrast(1.08)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0a0408]/75 to-black/90" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(196,30,58,0.18)_0%,_transparent_65%)]" />
        <img
          src={ICON}
          alt=""
          className="relative w-24 h-24 rounded-full object-cover border-2 border-[#c41e3a]/70 shadow-[0_0_50px_rgba(196,30,58,0.55)] animate-pulse"
        />
        <div className="relative text-[#c41e3a] font-mono text-sm tracking-[0.45em] uppercase drop-shadow-[0_0_16px_rgba(196,30,58,0.9)]">
          Emorce · Grave
        </div>
        <div className="relative w-56 h-[3px] bg-[#1a1218] overflow-hidden rounded-full border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#c41e3a] via-[#ff4d6d] to-[#00e5ff] shadow-[0_0_14px_#c41e3a] transition-all duration-200 ease-out"
            style={{ width: `${loadPct}%` }}
          />
        </div>
        <div className="relative text-[10px] text-[#7a7a90] tracking-[0.35em] font-mono">
          {loadPct}% · loading
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#e8e8f0] relative overflow-x-hidden selection:bg-[#c41e3a]/40">
      <audio ref={audioRef} src={MUSIC} preload="auto" />

      {/* Pinterest gif background — visible, not crushed to black */}
      <div
        className="fixed inset-0 -z-20 scale-[1.06]"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.2) contrast(1.08) brightness(0.92)",
        }}
      />
      {/* Soft vignette — keeps text readable, gif still shows */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/35 via-[#080408]/40 to-black/55" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(8,2,6,0.55)_100%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(196,30,58,0.08)_0%,_transparent_50%)]" />

      {/* Soft floating orbs */}
      <div className="fixed top-16 left-8 w-72 h-72 rounded-full bg-[#c41e3a]/[0.07] blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-24 right-12 w-96 h-96 rounded-full bg-[#00e5ff]/[0.04] blur-3xl -z-10 animate-pulse" style={{ animationDelay: "1.2s" }} />

      <header className="sticky top-0 z-20 border-b border-[#c41e3a]/15 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={ICON}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-[#c41e3a]/50 shadow-[0_0_12px_rgba(196,30,58,0.35)]"
            />
            <span className="font-bold tracking-tight text-[15px]">
              <span className="text-[#00e5ff]">Emorce</span>
              <span className="text-white">Hub</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-[#b0b0c0]">
            <a href="#how" className="hover:text-[#00e5ff] transition-colors duration-200">How It Works</a>
            <a href="#features" className="hover:text-[#00e5ff] transition-colors duration-200">Features</a>
            <a href="#pricing" className="hover:text-[#ff6b81] transition-colors duration-200">Pricing</a>
            <a href="#support" className="hover:text-white transition-colors duration-200">Support</a>
            <a
              href="https://discord.gg/emorce"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#00e5ff] transition-colors duration-200"
            >
              Discord
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                press("mute");
                toggleMute();
              }}
              className={`text-[10px] px-2.5 py-1 rounded-full border border-[#c41e3a]/25 text-[#c8c8d8] hover:border-[#c41e3a]/60 hover:text-white transition-all duration-150 ${
                pressed === "mute" ? "scale-95 opacity-80" : ""
              }`}
            >
              {muted ? "unmute" : musicReady ? "mute" : "music"}
            </button>
            <button
              type="button"
              onClick={() => {
                press("enter");
                setShowAccess(true);
              }}
              className={`text-sm px-4 py-1.5 rounded-full bg-gradient-to-r from-[#c41e3a] via-[#e83a5c] to-[#00c8e0] text-black font-semibold shadow-[0_0_22px_rgba(196,30,58,0.4)] hover:shadow-[0_0_28px_rgba(196,30,58,0.55)] transition-all duration-200 ${
                pressed === "enter" ? "scale-95" : "hover:scale-[1.02]"
              }`}
            >
              Enter Access
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#c41e3a]/35 bg-[#c41e3a]/[0.12] text-[11px] text-[#ff7a8e] font-mono tracking-wide shadow-[0_0_24px_rgba(196,30,58,0.18)] backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c41e3a] animate-pulse shadow-[0_0_6px_#c41e3a]" />
          EMORCE · DEMON BUILD · OWNER GATED
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.12] drop-shadow-[0_4px_40px_rgba(0,0,0,0.85)]">
          Protect Your Scripts
          <br />
          <span className="bg-gradient-to-r from-[#c41e3a] via-[#ff5c7a] to-[#00e5ff] bg-clip-text text-transparent">
            From Skidders
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-[#c0c0d0] text-sm md:text-[15px] leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
          Premium Emorce obfuscator. IRVM · HEXED · Honey · Volt. Upload, lock, ship a
          loadstring they cannot peel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => {
              press("start");
              setShowAccess(true);
            }}
            className={`px-7 py-3 rounded-full bg-gradient-to-r from-[#c41e3a] to-[#e83a5c] text-white font-semibold text-sm shadow-[0_0_32px_rgba(196,30,58,0.45)] hover:shadow-[0_0_40px_rgba(196,30,58,0.6)] transition-all duration-200 ${
              pressed === "start" ? "scale-95" : "hover:scale-[1.03]"
            }`}
          >
            Start Protecting
          </button>
          <a
            href="#pricing"
            onClick={() => playClick()}
            className="px-6 py-3 rounded-full border border-[#00e5ff]/35 text-sm text-[#d0f0f8] hover:border-[#00e5ff] hover:text-[#00e5ff] hover:bg-[#00e5ff]/5 transition-all duration-200 backdrop-blur-sm"
          >
            View Pricing
          </a>
        </div>
        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl border border-[#c41e3a]/25 bg-black/45 backdrop-blur-md shadow-[0_0_36px_rgba(196,30,58,0.12)]">
            <img
              src={OWNER_PFP}
              alt="owner"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#c41e3a]/55 shadow-[0_0_16px_rgba(196,30,58,0.3)]"
            />
            <div className="text-left">
              <div className="text-sm font-medium text-white">Site Owner</div>
              <div className="text-[11px] text-[#8a8a9a] font-mono">Emorce · discord.gg/emorce</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10 space-y-2">
          <div className="text-[10px] tracking-[0.3em] text-[#c41e3a] font-mono">PRICING</div>
          <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">Access tiers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-6 space-y-4 hover:border-[#00e5ff]/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(0,229,255,0.08)]">
            <div className="text-[10px] tracking-widest text-[#00e5ff] font-mono">WEEKLY</div>
            <div className="text-4xl font-bold">
              $5<span className="text-base text-[#6b6b80] font-normal"> / week</span>
            </div>
            <ul className="text-sm text-[#a8a8bc] space-y-2 text-left">
              <li>· All modes (IRVM / HEXED / Honey…)</li>
              <li>· Hosted + offline loadstrings</li>
              <li>· Password-gated manage page</li>
              <li>· Scripts bound to your API key</li>
            </ul>
            <a
              href="https://discord.gg/emorce"
              target="_blank"
              rel="noreferrer"
              onClick={() => playClick()}
              className="inline-block w-full text-center py-2.5 rounded-xl border border-[#00e5ff]/40 text-[#00e5ff] text-sm hover:bg-[#00e5ff]/10 transition-all duration-200"
            >
              Get Weekly · Discord
            </a>
          </div>
          <div className="rounded-2xl border border-[#c41e3a]/45 bg-black/50 backdrop-blur-md p-6 space-y-4 shadow-[0_0_40px_rgba(196,30,58,0.18)] hover:shadow-[0_0_50px_rgba(196,30,58,0.28)] transition-all duration-300">
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">LIFETIME</div>
            <div className="text-4xl font-bold">
              $22<span className="text-base text-[#6b6b80] font-normal"> once</span>
            </div>
            <ul className="text-sm text-[#a8a8bc] space-y-2 text-left">
              <li>· Everything in Weekly</li>
              <li>· Lifetime site key</li>
              <li>· Priority support</li>
              <li>· Future modes included</li>
            </ul>
            <a
              href="https://discord.gg/emorce"
              target="_blank"
              rel="noreferrer"
              onClick={() => playClick()}
              className="inline-block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#00c8e0] text-black font-semibold text-sm hover:opacity-95 transition-all duration-200"
            >
              Get Lifetime · Discord
            </a>
          </div>
        </div>
        <p className="text-center text-[11px] text-[#6b6b80] mt-6 max-w-lg mx-auto">
          Two keys on unlock: <span className="text-[#c41e3a]">homepage key</span> +{" "}
          <span className="text-[#00e5ff]">site key</span>. Owner uses demorce22. Buyers get issued keys from Discord.
        </p>
      </section>

      <section id="how" className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] tracking-[0.3em] text-[#c41e3a] font-mono">HOW IT WORKS</div>
          <h2 className="text-2xl font-bold drop-shadow-lg">Four steps</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["01", "Get access", "Weekly or lifetime via Discord. Owner sends keys."],
            ["02", "Enter Access", "Homepage key + site key → login / API key."],
            ["03", "Protect", "Paste Lua, IRVM/HEXED, script password."],
            ["04", "Ship", "Hosted or offline loadstring."],
          ].map(([n, t, d]) => (
            <div
              key={n}
              className="rounded-xl border border-[#c41e3a]/15 bg-black/45 backdrop-blur-sm p-4 text-left hover:border-[#c41e3a]/40 hover:bg-black/55 transition-all duration-250"
            >
              <div className="text-[#c41e3a] font-mono text-xs mb-1">{n}</div>
              <div className="font-medium text-white mb-1">{t}</div>
              <div className="text-[#9a9ab0] text-xs leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="text-[10px] tracking-[0.3em] text-[#c41e3a] font-mono">FEATURES</div>
          <h2 className="text-2xl font-bold drop-shadow-lg">Demon stack</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ["IRVM / HEXED", "Dual-stream cells, decoys, nested barrier."],
            ["Password view", "Browser asks for key. Scrapers get need key."],
            ["Dual keys", "Homepage key + site key. Owner and issued users."],
            ["Honey + Volt", "Anti-AI probes + anti-tamper shells."],
            ["Offline shell", "WeAreDevs outer bootstrap for executors."],
            ["API binding", "Every script locked to your key forever."],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-xl border border-white/10 bg-black/45 backdrop-blur-sm p-4 hover:border-[#00e5ff]/30 hover:bg-black/55 transition-all duration-250"
            >
              <div className="font-medium text-white mb-2">{t}</div>
              <div className="text-[#9a9ab0] text-xs leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="text-center space-y-2 mb-6">
          <div className="text-[10px] tracking-[0.3em] text-[#c41e3a] font-mono">SUPPORT</div>
          <h2 className="text-2xl font-bold drop-shadow-lg">Help</h2>
        </div>
        {[
          {
            id: "keys",
            q: "Homepage key vs site key?",
            a: "Homepage key is the outer gate (owner: demorce22 / emorce). Site key is your access or issued emorce_access_… key. Owner can use demorce22 as site key.",
          },
          {
            id: "buy",
            q: "How do I buy?",
            a: "discord.gg/emorce · ticket · $5 weekly or $22 lifetime. Owner issues your keys.",
          },
          {
            id: "owner",
            q: "Site owner access?",
            a: "demorce22 as site key (homepage key demorce22 or emorce). Never share owner key.",
          },
          {
            id: "modes",
            q: "Strongest mode?",
            a: "IRVM then HEXED. Default on the app is IRVM.",
          },
        ].map((item) => {
          const open = openFaq === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#c41e3a]/20 bg-black/45 backdrop-blur-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setOpenFaq(open ? null : item.id);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-[#c41e3a]/10 transition-colors duration-150"
              >
                <span>{item.q}</span>
                <span className={`text-[#c41e3a] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-xs text-[#9a9ab0] leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="text-center pt-4">
          <a
            href="https://discord.gg/emorce"
            target="_blank"
            rel="noreferrer"
            onClick={() => playClick()}
            className="text-sm text-[#00e5ff] hover:underline"
          >
            discord.gg/emorce · support
          </a>
        </div>
      </section>

      <footer className="border-t border-[#c41e3a]/12 py-8 text-center text-[11px] text-[#5a5a6a]">
        EmorceHub · demon build · not affiliated with Roblox
      </footer>

      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className={`w-full max-w-sm rounded-2xl border border-[#c41e3a]/40 bg-[#0a0608]/95 shadow-[0_0_60px_rgba(196,30,58,0.28)] backdrop-blur-xl ${
              shake ? "animate-pulse" : ""
            }`}
          >
            <div className="px-5 pt-5 pb-3 border-b border-[#c41e3a]/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={ICON}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-[#c41e3a]/50 shadow-[0_0_12px_rgba(196,30,58,0.35)]"
                />
                <div>
                  <div className="text-sm font-bold">Enter Access</div>
                  <div className="text-[10px] text-[#6b6b80] font-mono">homepage key + site key</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowAccess(false);
                }}
                className="text-[#6b6b80] hover:text-white text-lg leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <div className="text-[10px] text-[#c41e3a] tracking-widest font-mono mb-1.5">// HOMEPAGE KEY</div>
                <input
                  type="password"
                  value={homeKey}
                  onChange={(e) => setHomeKey(e.target.value)}
                  placeholder="homepage key"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-sm font-mono text-center focus:outline-none focus:border-[#c41e3a]/60 transition-colors"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-sm font-mono text-center focus:outline-none focus:border-[#00e5ff]/50 transition-colors"
                />
              </div>
              {error && (
                <div className="text-center text-sm text-red-400 font-mono animate-pulse">{error}</div>
              )}
              <button
                type="button"
                onClick={() => {
                  press("unlock");
                  submitAccess();
                }}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-[#c41e3a] to-[#a01830] text-white text-sm font-semibold shadow-[0_0_24px_rgba(196,30,58,0.4)] hover:shadow-[0_0_32px_rgba(196,30,58,0.55)] transition-all duration-200 ${
                  pressed === "unlock" ? "scale-95" : "hover:scale-[1.01]"
                }`}
              >
                Unlock
              </button>
              <p className="text-[10px] text-center text-[#5a5a6a]">
                Owner: site key <span className="text-[#c41e3a]">demorce22</span> · users: issued keys
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
