export type ScriptRecord = {
  id: string;
  customPath: string | null;
  passwordHash: string;
  source: string;
  loader: string;
  strength: "light" | "encoded" | "hardened";
  createdAt: number;
  updatedAt: number;
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
  const values = Array.from(scripts.values());
  for (let i = 0; i < values.length; i++) {
    if (values[i].customPath === key) return values[i];
  }
  return undefined;
}

export function saveRecord(record: ScriptRecord) {
  scripts.set(record.id, record);
  if (record.customPath) scripts.set(record.customPath, record);
}

export function deleteRecord(record: ScriptRecord) {
  scripts.delete(record.id);
  if (record.customPath) scripts.delete(record.customPath);
}
