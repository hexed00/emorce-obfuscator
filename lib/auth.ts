import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createPaste } from "./pastefy";

export type Account = {
  id: string;
  apiKeyHash: string;
  name: string;
  createdAt: number;
  scriptIds: string[];
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
    scriptIds: [],
    ipLog: true,
  };
  accounts.set(id, account);
  await createPaste(`emorce-acct-${id}`, JSON.stringify({ ...account }));
  return { account, apiKey };
}

export async function loginWithApiKey(apiKey: string): Promise<Account | null> {
  for (const acc of Array.from(accounts.values())) {
    if (await bcrypt.compare(apiKey, acc.apiKeyHash)) return acc;
  }
  return null;
}

export function getAccount(id: string): Account | undefined {
  return accounts.get(id);
}
