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
            filter: "saturate(1.2) contrast(1.1) brightness(0.72)",
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#120004]/50 to-black/70" />
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
          filter: "saturate(1.15) contrast(1.08) brightness(0.68)",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/35 via-[#0a0002]/45 to-black/75" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(0,0,0,0.55)_100%)]" />
      <div className="fixed top-8 left-4 w-96 h-96 rounded-full bg-[#8b0000]/20 blur-[100px] -z-10 animate-pulse" />
      <div
        className="fixed bottom-10 right-4 w-[28rem] h-[28rem] rounded-full bg-[#c41e3a]/12 blur-[110px] -z-10 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      <header className="sticky top-0 z-30 border-b border-[#8b0000]/40 bg-black/75 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={ICON} alt="" className="w-8 h-8 rounded-full object-cover border border-[#8b0000]/80 shadow-[0_0_18px_rgba(139,0,0,0.65)]" />
            <span className="font-bold tracking-tight text-[15px]"><span className="text-[#c41e3a]">Emorce</span><span className="text-[#e8b8bc]">Hub</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-[#b07078]">
            <a href="#how" className="hover:text-[#ff4d6d] transition">How It Works</a>
            <a href="#features" className="hover:text-[#ff4d6d] transition">Features</a>
            <a href="#pricing" className="hover:text-[#c41e3a] transition">Pricing</a>
            <a href="#support" className="hover:text-[#e8b8bc] transition">Support</a>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="hover:text-[#c41e3a] transition">Discord</a>
          </nav>
          <div className="flex items-center gap-2">
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
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10 space-y-2">
          <div className="text-[10px] tracking-[0.35em] text-[#c41e3a] font-mono">PRICING</div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e8c8cc]">Access tiers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#8b0000]/35 bg-black/65 p-6 space-y-4">
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">WEEKLY</div>
            <div className="text-4xl font-bold text-[#e8c8cc]">$5<span className="text-base text-[#5a3038] font-normal"> / week</span></div>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-flex w-full justify-center py-2.5 rounded-xl border border-[#8b0000]/60 text-[#c41e3a] text-sm">Get Weekly · Discord</a>
          </div>
          <div className="rounded-2xl border border-[#c41e3a]/60 bg-black/65 p-6 space-y-4 shadow-[0_0_48px_rgba(139,0,0,0.35)]">
            <div className="text-[10px] tracking-widest text-[#c41e3a] font-mono">LIFETIME</div>
            <div className="text-4xl font-bold text-[#e8c8cc]">$22<span className="text-base text-[#5a3038] font-normal"> once</span></div>
            <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-flex w-full justify-center py-2.5 rounded-xl bg-gradient-to-r from-[#8b0000] via-[#c41e3a] to-[#5a0008] text-[#f5d0d4] font-semibold text-sm">Get Lifetime · Discord</a>
          </div>
        </div>
      </section>

      {showAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border border-[#8b0000]/50 bg-[#0a0204]/95 shadow-[0_0_60px_rgba(139,0,0,0.45)] ${shake ? "animate-pulse" : ""}`}>
            <div className="px-5 pt-5 pb-3 border-b border-[#8b0000]/35 flex items-center justify-between">
              <div className="text-sm font-bold text-[#f0d0d4]">Enter Access</div>
              <button type="button" onClick={() => setShowAccess(false)} className="text-[#6a4048] hover:text-[#f0d0d4] text-lg">×</button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <div className="text-[10px] text-[#c41e3a] tracking-widest font-mono mb-1.5">// HOMEPAGE KEY</div>
                <input type="password" value={homeKey} onChange={(e) => setHomeKey(e.target.value)} placeholder="homepage key" className="w-full px-4 py-2.5 rounded-xl bg-black/90 border border-[#3a1018] text-sm font-mono text-center text-[#f0d0d4] focus:outline-none focus:border-[#c41e3a]/70" />
              </div>
              <div>
                <div className="text-[10px] text-[#ff6b81] tracking-widest font-mono mb-1.5">// SITE KEY</div>
                <input type="password" value={siteKey} onChange={(e) => setSiteKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAccess()} placeholder="site / access key" autoFocus className="w-full px-4 py-2.5 rounded-xl bg-black/90 border border-[#3a1018] text-sm font-mono text-center text-[#f0d0d4] focus:outline-none focus:border-[#c41e3a]/70" />
              </div>
              {error && <div className="text-center text-sm text-red-400 font-mono">{error}</div>}
              <button type="button" onClick={() => { press("unlock"); submitAccess(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b0000] via-[#c41e3a] to-[#5a0008] text-[#f8e8ea] text-sm font-semibold">Unlock</button>
              <p className="text-[10px] text-center text-[#5a3038]">Owner: site key <span className="text-[#c41e3a]">demorce22</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
