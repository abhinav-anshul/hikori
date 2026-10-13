"use server";

import { headers } from "next/headers";

import { isGuestLinkRateLimited } from "@/lib/rate-limit";
import { getServerClient } from "@/lib/supabase";
import { normalizeUrl } from "@/lib/url";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LENGTH = 7;
const MAX_SLUG_ATTEMPTS = 3;

function randomSlug(): string {
    let s = "";
    for (let i = 0; i < SLUG_LENGTH; i++) {
        s += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
    }
    return s;
}

export type GuestLinkResult = { slug: string } | { error: true };

export async function createGuestLink(rawUrl: string): Promise<GuestLinkResult> {
    const h = await headers();
    const xff = h.get("x-forwarded-for");
    const ip = xff?.split(",")[0]?.trim() ?? "unknown";

    if (await isGuestLinkRateLimited(ip)) {
        return { error: true };
    }

    const targetUrl = normalizeUrl(rawUrl);
    if (!targetUrl) {
        return { error: true };
    }

    const supabase = await getServerClient();

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
        const slug = randomSlug();
        const { error } = await supabase.rpc("create_guest_link", {
            p_slug: slug,
            p_target_url: targetUrl,
        });

        if (!error) return { slug };
        // 23505 = unique violation on the slug — our collision, retry
        // with a new one rather than surfacing an error to the guest.
        if (error.code !== "23505") return { error: true };
    }

    return { error: true };
}
