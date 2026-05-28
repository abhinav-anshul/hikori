import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UAParser } from "ua-parser-js";

import { hashIp } from "@/lib/hash-ip";
import { getServerClient } from "@/lib/supabase";

const BOT_UA_RE = /bot|crawl|spider|slurp|fetcher|preview|curl|wget|axios|httpclient/i;

function first(
    sp: Record<string, string | string[] | undefined>,
    key: string,
): string | null {
    const v = sp[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v[0] ?? null;
    return null;
}

function parseReferrerHost(referrer: string | null): string | null {
    if (!referrer) return null;
    try {
        return new URL(referrer).hostname;
    } catch {
        return null;
    }
}

export default async function SlugRedirect({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const [{ slug }, sp, h] = await Promise.all([
        params,
        searchParams,
        headers(),
    ]);

    const referrer = h.get("referer");
    const userAgent = h.get("user-agent");

    const ua = userAgent ? new UAParser(userAgent).getResult() : null;
    const deviceType =
        ua?.device.type ?? (ua?.browser.name ? "desktop" : null);
    const isBot = !!userAgent && BOT_UA_RE.test(userAgent);

    const xff = h.get("x-forwarded-for");
    const ip = xff?.split(",")[0]?.trim() ?? null;
    const ipHash = ip ? await hashIp(ip) : null;

    const supabase = await getServerClient();
    const { data: targetUrl } = await supabase.rpc("resolve_and_track", {
        p_slug: slug,
        p_referrer: referrer,
        p_referrer_host: parseReferrerHost(referrer),
        p_utm_source: first(sp, "utm_source"),
        p_utm_medium: first(sp, "utm_medium"),
        p_utm_campaign: first(sp, "utm_campaign"),
        p_utm_term: first(sp, "utm_term"),
        p_utm_content: first(sp, "utm_content"),
        p_user_agent: userAgent,
        p_browser_name: ua?.browser.name ?? null,
        p_browser_version: ua?.browser.version ?? null,
        p_os_name: ua?.os.name ?? null,
        p_os_version: ua?.os.version ?? null,
        p_device_type: deviceType,
        p_is_bot: isBot,
        p_country:
            h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null,
        p_region:
            h.get("x-vercel-ip-country-region") ?? h.get("cf-region") ?? null,
        p_city: h.get("x-vercel-ip-city") ?? h.get("cf-ipcity") ?? null,
        p_ip_hash: ipHash,
        p_language: h.get("accept-language")?.split(",")[0]?.trim() ?? null,
    });

    if (!targetUrl) notFound();
    redirect(targetUrl);
}
