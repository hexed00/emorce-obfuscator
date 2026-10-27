export default function Page() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <img src="/pin.svg" alt="Emorce" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-white">Terms of Service</h1>
      </div>
      <div className="text-sm text-[#9a9ab0] space-y-3 leading-relaxed">
        <p>EmorceHub is provided as-is for script protection and key tooling.</p>
        <p>You are responsible for how you distribute and run loadstrings.</p>
        <p>API keys are non-recoverable. Store them safely.</p>
        <p>Abuse, spam, or attacks against the service may result in blocked keys.</p>
      </div>
      <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#00e5ff]">
        <img src="/pin.svg" alt="" className="w-4 h-4" />
        Discord · discord.gg/emorce
      </a>
    </div>
  );
}
