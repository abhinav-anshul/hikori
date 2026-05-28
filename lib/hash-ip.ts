const encoder = new TextEncoder();

// Daily-rotating SHA-256 hash of (ip + salt + YYYY-MM-DD).
// Returns null when no salt is configured so we never store an
// under-protected identifier by accident — set CLICK_IP_SALT to
// opt in to unique-visitor tracking.
export async function hashIp(ip: string): Promise<string | null> {
    const salt = process.env.CLICK_IP_SALT;
    if (!salt) return null;

    const day = new Date().toISOString().slice(0, 10);
    const input = `${ip}|${salt}|${day}`;
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));

    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
