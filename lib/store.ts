// In-memory store for demo / single-instance. For production use Vercel KV / Redis / DB.

export type ScriptRecord = {
  id: string;
  customPath: string | null;
  passwordHash: string;
  source: string;
  createdAt: number;
  updatedAt: number;
  owner?: string;
};

const globalStore = globalThis as unknown as {
  __emorceScripts?: Map<string, ScriptRecord>;
};

if (!globalStore.__emorceScripts) {
  globalStore.__emorceScripts = new Map();
}

export const scripts = globalStore.__emorceScripts;

export function getByIdOrPath(key: string): ScriptRecord | undefined {
  if (scripts.has(key)) return scripts.get(key);
  for (const s of scripts.values()) {
    if (s.customPath === key) return s;
  }
  return undefined;
}
