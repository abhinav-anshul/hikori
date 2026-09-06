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

// Returns the full origin (with protocol) from NEXT_PUBLIC_APP_URL,
// e.g. "https://hikori.co". Falls back to the production domain so
// metadata routes (sitemap, robots) always emit absolute URLs.
export function getBaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_APP_URL;
    if (!url) return "https://hikori.co";
    try {
        return new URL(url).origin;
    } catch {
        return "https://hikori.co";
    }
}
