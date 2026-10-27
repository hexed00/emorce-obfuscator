import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createPaste, getPasteRaw } from "./pastefy";

export type SavedScript = {
  id: string;
  key: string;
  strength: string;
  chars: number;
  createdAt: number;
  customPath: string | null;
  passwordHint?: string;
};

export type Account = {
  id: string;
  apiKeyHash: string;
  keyId: string;
  name: string;
  createdAt: number;
  scripts: SavedScript[];
  webhookUrl?: string;
  ipLog?: boolean;
};

const g = globalThis as unknown as { __emorceAccounts?: Map<string, Account> };
if (!g.__emorceAccounts) g.__emorceAccounts = new Map();
export const accounts = g.__emorceAccounts;

function keyIdOf(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex").slice(0, 24);
}

export function generateApiKey(): string {
  return "emorce_" + crypto.randomBytes(24).toString("base64url");
}

async function loadAccountByKeyId(keyId: string): Promise<Account | null> {
  for (const a of Array.from(accounts.values())) {
    if (a.keyId === keyId) return a;
  }
  try {
    const raw = await getPasteRaw(`emorce-acct-kid-${keyId}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as Account;
    if (!data.id) return null;
    accounts.set(data.id, data);
    return data;
  } catch {
    return null;
  }
}

async function persistAccount(account: Account) {
  try {
    const payload = JSON.stringify({
      id: account.id,
      apiKeyHash: account.apiKeyHash,
      keyId: account.keyId,
      name: account.name,
      createdAt: account.createdAt,
      scripts: account.scripts,
      webhookUrl: account.webhookUrl,
      ipLog: account.ipLog,
    });
    await createPaste(`emorce-acct-kid-${account.keyId}`, payload);
    await createPaste(`emorce-acct-${account.id}`, payload);
  } catch {
    /* ignore */
  }
}

export async function createAccount(name: string): Promise<{ account: Account; apiKey: string }> {
  const apiKey = generateApiKey();
  const apiKeyHash = await bcrypt.hash(apiKey, 10);
  const keyId = keyIdOf(apiKey);
  const id = crypto.randomBytes(8).toString("hex");
  const account: Account = {
    id,
    apiKeyHash,
    keyId,
    name: name || "user",
    createdAt: Date.now(),
    scripts: [],
    ipLog: true,
  };
  accounts.set(id, account);
  await persistAccount(account);
  return { account, apiKey };
}

export async function loginWithApiKey(apiKey: string): Promise<Account | null> {
  if (!apiKey.startsWith("emorce_")) return null;
  const keyId = keyIdOf(apiKey);
  const acc = await loadAccountByKeyId(keyId);
  if (!acc) return null;
  const ok = await bcrypt.compare(apiKey, acc.apiKeyHash);
  if (!ok) return null;
  return acc;
}

export async function findAccountByApiKey(apiKey: string): Promise<Account | null> {
  return loginWithApiKey(apiKey);
}

export async function addScriptToAccount(
  apiKey: string,
  script: SavedScript
): Promise<Account | null> {
  const acc = await findAccountByApiKey(apiKey);
  if (!acc) return null;
  acc.scripts = [script, ...acc.scripts.filter((s) => s.key !== script.key)].slice(0, 200);
  accounts.set(acc.id, acc);
  await persistAccount(acc);
  return acc;
}

export function getAccount(id: string): Account | undefined {
  return accounts.get(id);
}
