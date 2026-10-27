import { createPaste, getPasteRaw } from "./pastefy";

export type ScriptRecord = {
  id: string;
  customPath: string | null;
  passwordHash: string;
  source: string;
  loader: string;
  strength: "light" | "encoded" | "hardened";
  pasteId: string | null;
  metaPasteId: string | null;
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
  if (record.pasteId) scripts.set(record.pasteId, record);
}

export function deleteRecord(record: ScriptRecord) {
  scripts.delete(record.id);
  if (record.customPath) scripts.delete(record.customPath);
  if (record.pasteId) scripts.delete(record.pasteId);
}

export async function persistToPastefy(record: ScriptRecord): Promise<ScriptRecord> {
  const loaderPaste = await createPaste(
    `emorce-loader-${record.id}`,
    record.loader
  );
  if (loaderPaste) {
    record.pasteId = loaderPaste.id;
  }

  const meta = {
    id: record.id,
    customPath: record.customPath,
    passwordHash: record.passwordHash,
    strength: record.strength,
    pasteId: record.pasteId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  const metaPaste = await createPaste(
    `emorce-meta-${record.id}`,
    JSON.stringify(meta)
  );
  if (metaPaste) {
    record.metaPasteId = metaPaste.id;
  }

  saveRecord(record);
  return record;
}

export async function recoverLoader(record: ScriptRecord): Promise<string | null> {
  if (record.loader) return record.loader;
  if (record.pasteId) {
    const raw = await getPasteRaw(record.pasteId);
    if (raw) {
      record.loader = raw;
      saveRecord(record);
      return raw;
    }
  }
  return null;
}

export async function fetchLoaderByPasteId(pasteId: string): Promise<string | null> {
  return getPasteRaw(pasteId);
}
