import crypto from "crypto";

const SECRET =
  process.env.EMORCE_TOKEN_SECRET || "emorce-hub-token-v1-hexed";

export function makeToken(pasteId: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(pasteId)
    .digest("base64url")
    .slice(0, 16);
}

export function checkToken(pasteId: string, token: string | null): boolean {
  if (!token) return false;
  const expected = makeToken(pasteId);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(token.padEnd(expected.length).slice(0, expected.length))
    );
  } catch {
    return false;
  }
}
