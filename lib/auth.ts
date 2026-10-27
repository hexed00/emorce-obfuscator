import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createPaste } from "./pastefy";

export type SavedScript = {
  id: string;
  key: string;
  strength: string;
  chars: number;
  createdAt: number;
  customPath: string | null;
};

export type Account = {
  id: string;
  apiKeyHash: string;
  name: string;
  createdAt: number;
  scripts: SavedScript[];
  webhookUrl?: string;
  ipLog?: boolean;
};

const g = globalThis as unknown as { __emorceAccounts?: Map<string, Account> };
if (!g.__emorceAccounts) g.__emorceAccounts = new Map();
export const accounts = g.__emorceAccounts;

export function generateApiKey(): string {
  return "emorce_" + crypto.randomBytes(24).toString("base64url");
}

export async function createAccount(name: string): Promise<{ account: Account; apiKey: string }> {
  const apiKey = generateApiKey();
  const apiKeyHash = await bcrypt.hash(apiKey, 10);
  const id = crypto.randomBytes(8).toString("hex");
  const account: Account = {
    id,
    apiKeyHash,
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
  for (const acc of Array.from(accounts.values())) {
    if (await bcrypt.compare(apiKey, acc.apiKeyHash)) return acc;
  }
  return null;
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

async function persistAccount(account: Account) {
  try {
    await createPaste(
      `emorce-acct-${account.id}`,
      JSON.stringify({
        id: account.id,
        apiKeyHash: account.apiKeyHash,
        name: account.name,
        createdAt: account.createdAt,
        scripts: account.scripts,
        webhookUrl: account.webhookUrl,
        ipLog: account.ipLog,
      })
    );
  } catch {
    /* ignore */
  }
}

export function getAccount(id: string): Account | undefined {
  return accounts.get(id);
}
