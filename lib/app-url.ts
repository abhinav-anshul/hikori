// Returns the bare host (no protocol) from NEXT_PUBLIC_APP_URL,
// e.g. "localhost:3000" or "hikori.co". Returns "" when unset
// so callers can gracefully fall back to just rendering "/<slug>".
export function getAppHost(): string {
    const url = process.env.NEXT_PUBLIC_APP_URL;
    if (!url) return "";
    try {
        return new URL(url).host;
    } catch {
        return "";
    }
}
