// Shared URL validation — used client-side for instant feedback and
// server-side as the authoritative check. Never trust the client-side
// pass alone on a public write endpoint.
export function normalizeUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withProto = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    try {
        const url = new URL(withProto);
        if (!url.hostname.includes(".")) return null;
        return url.toString();
    } catch {
        return null;
    }
}
