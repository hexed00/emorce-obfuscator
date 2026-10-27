export default function Page() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <img src="/pin.svg" alt="Emorce" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
      </div>
      <div className="text-sm text-[#9a9ab0] space-y-3 leading-relaxed">
        <p>API keys are hashed server-side. We cannot recover a lost key.</p>
        <p>Encoded loaders may be stored on Pastefy so hosted links survive restarts.</p>
        <p>IP integration only runs if you embed the webhook snippet yourself.</p>
        <p>No selling of account data. Support via Discord only.</p>
      </div>
      <a href="https://discord.gg/emorce" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#00e5ff]">
        <img src="/pin.svg" alt="" className="w-4 h-4" />
        Discord · discord.gg/emorce
      </a>
    </div>
  );
}
