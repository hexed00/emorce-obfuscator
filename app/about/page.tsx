export default function Page() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <img src="/pin.svg" alt="Emorce" className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-bold text-white">Help · EmorceHub</h1>
          <p className="text-sm text-[#9a9ab0]">Script protection, keys, integrations</p>
        </div>
      </div>
      <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c12] p-5 space-y-3 text-sm text-[#b8b8c8]">
        <p>Protect scripts on Obfuscator → copy hosted loadstring (includes token).</p>
        <p>Key Manager builds an EmorceHub key UI — prepend before protect.</p>
        <p>Integrations → webhook snippet logs IP + player when the script runs.</p>
        <p>API key is your account. Lose it and you lose access to saved scripts.</p>
      </div>
      <a
        href="https://discord.gg/emorce"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#c41e3a] text-white text-sm font-medium"
      >
        <img src="/pin.svg" alt="" className="w-4 h-4 brightness-0 invert" />
        Join Discord
      </a>
    </div>
  );
}
