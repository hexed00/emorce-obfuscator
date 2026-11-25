"use client";

import { useEffect, useRef, useState } from "react";

const BG = "https://i.pinimg.com/1200x/28/0e/29/280e299d50cb92f5612cbf54a42623ab.jpg";
const OWNER_PFP = "https://i.pinimg.com/1200x/ce/00/6c/ce006ceb951d81ad06ded1c116f75bdc.jpg";
const ICON = "https://i.pinimg.com/736x/b6/5c/9f/b65c9ffe02a7ffad3e5b3685a3daa08e.jpg";
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
  const [openMenu, setOpenMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);

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

  useEffect(() => {
    if (loading) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.38;
    a.loop = true;
    const tryPlay = () => {
      a.play().then(() => setMusicReady(true)).catch(() => {});
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
        o.frequency.value = 720;
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
      <div className="min-h-screen bg-[#020000] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(1.35) contrast(1.2) brightness(0.42)",
            opacity: 0.55,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0004]/90 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.25)_0%,transparent_60%)]" />
        <img
          src={ICON}
          alt=""
          className="relative w-28 h-28 rounded-full object-cover border-2 border-[#8b0000] shadow-[0_0_60px_rgba(139,0,0,0.85)] animate-pulse"
        />
        <div className="relative text-[#c41e3a] font-mono text-sm tracking-[0.55em] uppercase drop-shadow-[0_0_20px_rgba(196,30,58,1)]">
          Emorce · Blood
        </div>
        <div className="relative w-64 h-[3px] bg-[#120004] overflow-hidden rounded-full border border-[#3a0008]">
          <div
            className="h-full bg-gradient-to-r from-[#5a0008] via-[#c41e3a] to-[#8b0000] shadow-[0_0_16px_#c41e3a] transition-all duration-200"
            style={{ width: `${loadPct}%` }}
          />
        </div>
        <div className="relative text-[10px] text-[#6a2030] tracking-[0.4em] font-mono">
          {loadPct}% · rising
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#e8c8cc] relative overflow-x-hidden selection:bg-[#8b0000]/60">
      <audio ref={audioRef} src={MUSIC} preload="auto" loop />
      <div
        className="fixed inset-0 -z-20 scale-[1.06]"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "saturate(1.25) contrast(1.18) brightness(0.38)",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/55 via-[#0a0002]/70 to-black/95" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_5%,_rgba(0,0,0,0.8)_100%)]" />
      <div className="fixed top-8 left-4 w-96 h-96 rounded-full bg-[#8b0000]/20 blur-[100px] -z-10 animate-pulse" />
      <div
        className="fixed bottom-10 right-4 w-[28rem] h-[28rem] rounded-full bg-[#c41e3a]/12 blur-[110px] -z-10 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      <header className="sticky top-0 z-30 border-b border-[#8b0000]/40 bg-black/75 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={ICON}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-[#8b0000]/80 shadow-[0_0_18px_rgba(139,0,0,0.65)]"
            />
            <span className="font-bold tracking-tight text-[15px]">
              <span className="text-[#c41e3a]">Emorce</span>
              <span className="text-[#e8b8bc]">Hub</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-[#b07078]">
            <a href="#how" className="hover:text-[#ff4d6d] transition">How It Works</a>
            <a href="#features" className="hover:text-[#ff4d6d] transition">Features</a>
            <a href="#pricing" className="hover:text-[#c41e3a] transition">Pricing</a>
            <a href="#support" className="hover:text-[#e8b8bc] transition">Support</a>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="hover:text-[#c41e3a] transition">Discord</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative md:hidden">
              <button type="button" onClick={() => { press("menu"); setOpenMenu((v) => !v); }} className="text-[10px] px-2.5 py-1 rounded-full border border-[#8b0000]/55 text-[#c08088]">menu</button>
              {openMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#8b0000]/55 bg-[#0a0002]/95 backdrop-blur-xl py-2 z-40 shadow-[0_0_30px_rgba(139,0,0,0.5)]">
                  {[["#how","How It Works"],["#features","Features"],["#pricing","Pricing"],["#support","Support"],["https://discord.gg/emorce","Discord"]].map(([href,label]) => (
                    <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} onClick={() => { playClick(); setOpenMenu(false); }} className="block px-4 py-2 text-sm text-[#c08088] hover:bg-[#8b0000]/30 hover:text-[#ff6b81]">{label}</a>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => { press("mute"); toggleMute(); }} className={`text-[10px] px-2.5 py-1 rounded-full border border-[#8b0000]/50 text-[#c08088] ${pressed === "mute" ? "scale-95" : ""}`}>{muted ? "unmute" : musicReady ? "mute" : "music"}</button>
            <button type="button" onClick={() => { press("enter"); setShowAccess(true); }} className={`text-sm px-5 py-2 rounded-full bg-gradient-to-r from-[#5a0008] via-[#c41e3a] to-[#8b0000] text-[#f5d0d4] font-semibold shadow-[0_0_28px_rgba(139,0,0,0.6)] border border-[#c41e3a]/45 ${pressed === "enter" ? "scale-95" : "hover:scale-[1.04]"}`}>Enter Access</button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#8b0000]/60 bg-[#8b0000]/25 text-[11px] text-[#ff6b81] font-mono tracking-wide shadow-[0_0_28px_rgba(139,0,0,0.35)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c41e3a] animate-pulse shadow-[0_0_10px_#c41e3a]" />
          EMORCE · VAMPIRE BUILD · OWNER GATED
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] drop-shadow-[0_6px_40px_rgba(0,0,0,0.95)]">
          Protect Your Scripts<br />
          <span className="bg-gradient-to-r from-[#8b0000] via-[#ff2d55] to-[#c41e3a] bg-clip-text text-transparent">From Skidders</span>
        </h1>
        <p className="max-w-xl mx-auto text-[#a87880] text-sm md:text-[15px] leading-relaxed">
          Premium Emorce obfuscator. IRVM · HEXED · Honey · Volt. Upload, lock, ship a loadstring they cannot peel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button type="button" onClick={() => { press("start"); setShowAccess(true); }} className={`px-7 py-3 rounded-full bg-gradient-to-r from-[#8b0000] via-[#c41e3a] to-[#5a0008] text-[#f5d0d4] font-semibold text-sm shadow-[0_0_36px_rgba(139,0,0,0.6)] border border-[#c41e3a]/45 ${pressed === "start" ? "scale-95" : "hover:scale-[1.03]"}`}>Start Protecting</button>
          <a href="#pricing" onClick={() => playClick()} className="px-6 py-3 rounded-full border border-[#8b0000]/60 text-sm text-[#c8989c] hover:border-[#c41e3a] hover:text-[#ff6b81] hover:bg-[#8b0000]/20 transition">View Pricing</a>
        </div>
        <div className="pt-8 flex flex-wrap justify-center gap-3 text-[11px] font-mono">
          {[["IRVM","bytecode cells"],["HEXED","LCG + S-box"],["Honey","anti-AI"],["Volt","env lock"]].map(([k,v]) => (
            <div key={k} className="px-3.5 py-2 rounded-xl border border-[#8b0000]/40 bg-black/60 text-left hover:border-[#c41e3a]/70 transition shadow-[0_0_20px_rgba(139,0,0,0.15)]">
              <div className="text-[#ff4d6d] font-semibold">{k}</div>
              <div className="text-[#5a3038]">{v}</div>
            </div>
          ))}
        </div>
        <div className="pt-8 flex justify-center">
          <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl border border-[#8b0000]/45 bg-black/65 backdrop-blur-md shadow-[0_0_40px_rgba(139,0,0,0.3)]">
            <img src={OWNER_PFP} alt="owner" className="w-12 h-12 rounded-full object-cover border-2 border-[#8b0000]/80" />
            <div className="text-left">
              <div className="text-sm font-medium text-[#e8c8cc]">Site Owner</div>
              <div className="text-[11px] text-[#6a4048] font-mono">Emorce · discord.gg/emorce</div>
            </div>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" onClick={() => playClick()} className="ml-2 text-[11px] px-3 py-1.5 rounded-full border border-[#8b0000]/55 text-[#c41e3a] hover:bg-[#8b0000]/25">Join</a>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10 space-y-2">
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono">PRICING</div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e8c8cc]">Access tiers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#8b0000]/35 bg-black/65 p-6 space-y-4 hover:border-[#c41e3a]/55 transition shadow-[0_0_30px_rgba(139,0,0,0.12)]">
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">WEEKLY</div>
            <div className="text-4xl font-bold text-[#e8c8cc]">$5<span className="text-base text-[#5a3038] font-normal"> / week</span></div>
            <ul className="text-sm text-[#a07078] space-y-2 text-left">
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> All modes</li>
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Hosted + offline loadstrings</li>
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Password-gated manage page</li>
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Scripts bound to API key</li>
            </ul>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" onClick={() => playClick()} className="inline-flex w-full justify-center py-2.5 rounded-xl border border-[#8b0000]/60 text-[#c41e3a] text-sm hover:bg-[#8b0000]/20">Get Weekly · Discord</a>
          </div>
          <div className="rounded-2xl border border-[#c41e3a]/60 bg-black/65 p-6 space-y-4 shadow-[0_0_48px_rgba(139,0,0,0.35)] relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[9px] tracking-widest px-2 py-0.5 rounded-full bg-[#8b0000]/40 text-[#ff6b81] border border-[#c41e3a]/55 font-mono">BEST</div>
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">LIFETIME</div>
            <div className="text-4xl font-bold text-[#e8c8cc]">$22<span className="text-base text-[#5a3038] font-normal"> once</span></div>
            <ul className="text-sm text-[#a07078] space-y-2 text-left">
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Everything in Weekly</li>
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Lifetime site key</li>
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Priority support</li>
              <li className="flex gap-2"><span className="text-[#c41e3a]">✓</span> Future modes included</li>
            </ul>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" onClick={() => playClick()} className="inline-flex w-full justify-center py-2.5 rounded-xl bg-gradient-to-r from-[#8b0000] via-[#c41e3a] to-[#5a0008] text-[#f5d0d4] font-semibold text-sm border border-[#c41e3a]/45">Get Lifetime · Discord</a>
          </div>
        </div>
        <p className="text-center text-[11px] text-[#5a3038] mt-6">Two keys: <span className="text-[#c41e3a]">homepage</span> + <span className="text-[#ff6b81]">site</span>. Owner: demorce22.</p>
      </section>

      <section id="how" className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono">HOW IT WORKS</div>
          <h2 className="text-2xl font-bold text-[#e8c8cc]">Four steps</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[["01","Get access","Weekly or lifetime via Discord."],["02","Enter Access","Homepage key + site key → login."],["03","Protect","Paste Lua, IRVM/HEXED, password."],["04","Ship","Hosted or offline loadstring."]].map(([n,t,d]) => (
            <div key={n} className="rounded-xl border border-[#8b0000]/35 bg-black/60 p-4 text-left hover:border-[#c41e3a]/55 transition">
              <div className="text-[#c41e3a] font-mono text-xs mb-1">{n}</div>
              <div className="font-medium text-[#e8c8cc] mb-1">{t}</div>
              <div className="text-[#7a5058] text-xs">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono">FEATURES</div>
          <h2 className="text-2xl font-bold text-[#e8c8cc]">Blood stack</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[["IRVM / HEXED","Dual-stream cells, decoys, nested barrier."],["Password view","Browser asks for key. Scrapers get need key."],["Dual keys","Homepage + site key. Owner and issued users."],["Honey + Volt","Anti-AI probes + anti-tamper shells."],["Offline shell","WeAreDevs outer bootstrap."],["API binding","Scripts locked to your key."]].map(([t,d]) => (
            <div key={t} className="rounded-xl border border-[#8b0000]/30 bg-black/60 p-4 hover:border-[#c41e3a]/50 transition">
              <div className="font-medium text-[#e8c8cc] mb-2">{t}</div>
              <div className="text-[#7a5058] text-xs">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="text-center space-y-2 mb-6">
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono">SUPPORT</div>
          <h2 className="text-2xl font-bold text-[#e8c8cc]">Help</h2>
        </div>
        {[{id:"keys",q:"Homepage key vs site key?",a:"Homepage is outer gate (demorce22 / emorce). Site key is demorce22 or issued emorce_access_…"},{id:"buy",q:"How do I buy?",a:"discord.gg/emorce · $5 weekly or $22 lifetime."},{id:"owner",q:"Owner access?",a:"Site key demorce22. Never share it."},{id:"modes",q:"Strongest mode?",a:"IRVM then HEXED. Default IRVM."}].map((item) => {
          const open = openFaq === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-[#8b0000]/40 bg-black/60 overflow-hidden">
              <button type="button" onClick={() => { playClick(); setOpenFaq(open ? null : item.id); }} className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#d8b0b4] hover:bg-[#8b0000]/20">
                <span>{item.q}</span>
                <span className={`text-[#c41e3a] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
              </button>
              <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden"><p className="px-4 pb-4 text-xs text-[#7a5058]">{item.a}</p></div>
              </div>
            </div>
          );
        })}
        <div className="text-center pt-4">
          <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" onClick={() => playClick()} className="text-sm text-[#c41e3a] hover:underline">discord.gg/emorce · support</a>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-[#8b0000]/50 bg-gradient-to-br from-[#8b0000]/25 via-black/75 to-[#3a0008]/50 p-8 text-center space-y-4 shadow-[0_0_60px_rgba(139,0,0,0.3)]">
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono">RISE</div>
          <h2 className="text-xl md:text-2xl font-bold text-[#e8c8cc]">Lock your next script in under a minute</h2>
          <p className="text-sm text-[#7a5058] max-w-md mx-auto">Owner gate → API key → IRVM loadstring.</p>
          <button type="button" onClick={() => { press("cta"); setShowAccess(true); }} className="px-7 py-3 rounded-full bg-gradient-to-r from-[#8b0000] via-[#c41e3a] to-[#5a0008] text-[#f5d0d4] font-semibold text-sm shadow-[0_0_32px_rgba(139,0,0,0.55)] border border-[#c41e3a]/45">Enter Access</button>
        </div>
      </section>

      <footer className="border-t border-[#8b0000]/30 py-8 text-center text-[11px] text-[#5a3038]">
        <span className="text-[#c41e3a]">EmorceHub</span> · Vampire build · Owner gated
      </footer>

      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border border-[#8b0000]/55 bg-[#0a0002]/95 shadow-[0_0_60px_rgba(139,0,0,0.5)] ${shake ? "animate-pulse" : ""}`}>
            <div className="px-5 pt-5 pb-3 border-b border-[#8b0000]/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={ICON} alt="" className="w-9 h-9 rounded-full object-cover border border-[#8b0000]/70" />
                <div>
                  <div className="text-sm font-bold text-[#e8c8cc]">Enter Access</div>
                  <div className="text-[10px] text-[#5a3038] font-mono">homepage key + site key</div>
                </div>
              </div>
              <button type="button" onClick={() => { playClick(); setShowAccess(false); }} className="text-[#5a3038] hover:text-[#e8c8cc] text-lg">×</button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <div className="text-[10px] text-[#c41e3a] tracking-widest font-mono mb-1.5">// HOMEPAGE KEY</div>
                <input type="password" value={homeKey} onChange={(e) => setHomeKey(e.target.value)} placeholder="homepage key" className="w-full px-4 py-2.5 rounded-xl bg-black/90 border border-[#3a1018] text-sm font-mono text-center text-[#e8c8cc] focus:outline-none focus:border-[#c41e3a]/80 placeholder:text-[#4a2028]" />
              </div>
              <div>
                <div className="text-[10px] text-[#ff6b81] tracking-widest font-mono mb-1.5">// SITE KEY</div>
                <input type="password" value={siteKey} onChange={(e) => setSiteKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAccess()} placeholder="site / access key" autoFocus className="w-full px-4 py-2.5 rounded-xl bg-black/90 border border-[#3a1018] text-sm font-mono text-center text-[#e8c8cc] focus:outline-none focus:border-[#c41e3a]/80 placeholder:text-[#4a2028]" />
              </div>
              {error && <div className="text-center text-sm text-[#ff4d6d] font-mono animate-pulse">{error}</div>}
              <button type="button" onClick={() => { press("unlock"); submitAccess(); }} className={`w-full py-3 rounded-xl bg-gradient-to-r from-[#8b0000] via-[#c41e3a] to-[#5a0008] text-[#f5d0d4] text-sm font-semibold shadow-[0_0_28px_rgba(139,0,0,0.55)] border border-[#c41e3a]/45 ${pressed === "unlock" ? "scale-95" : "hover:scale-[1.01]"}`}>Unlock</button>
              <p className="text-[10px] text-center text-[#5a3038]">Owner: site key <span className="text-[#c41e3a]">demorce22</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
