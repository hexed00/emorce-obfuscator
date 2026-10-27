/**
 * Durable storage via Pastefy (anonymous UNLISTED pastes).
 * Loader script is public (encoded) — raw source never goes to pastefy.
 */

const PASTEFY = "https://pastefy.app/api/v2";

export async function createPaste(
  title: string,
  content: string
): Promise<{ id: string; rawUrl: string } | null> {
  try {
    const res = await fetch(`${PASTEFY}/paste`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        type: "PASTE",
        title,
        content,
        visibility: "UNLISTED",
        encrypted: false,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success || !data?.paste?.id) return null;
    return {
      id: data.paste.id,
      rawUrl: data.paste.raw_url || `https://pastefy.app/${data.paste.id}/raw`,
    };
  } catch {
    return null;
  }
}

export async function getPasteRaw(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://pastefy.app/${id}/raw`, {
      headers: { Accept: "text/plain" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function getPasteJson(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${PASTEFY}/paste/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
