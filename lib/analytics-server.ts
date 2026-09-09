import "server-only";

import {
    rangeBounds,
    type Analytics,
    type AnalyticsRange,
} from "@/lib/analytics";
import { getServerClient } from "@/lib/supabase";

const EMPTY: Omit<Analytics, "bucket"> = {
    total: 0,
    uniques: 0,
    series: [],
    top_links: [],
    top_referrers: [],
    top_devices: [],
    top_countries: [],
    top_browsers: [],
    top_os: [],
};

export async function getAnalytics(
    range: AnalyticsRange,
    {
        linkId,
        excludeBots = false,
    }: { linkId?: string; excludeBots?: boolean } = {},
): Promise<Analytics> {
    const { from, to, bucket } = rangeBounds(range);
    const supabase = await getServerClient();
    const { data, error } = await supabase.rpc("get_analytics", {
        p_from: from,
        p_to: to,
        p_bucket: bucket,
        p_link_id: linkId ?? null,
        p_exclude_bots: excludeBots,
    });

    if (error) console.error("get_analytics rpc error:", error);
    if (error || !data) return { ...EMPTY, bucket };
    return { ...(data as Omit<Analytics, "bucket">), bucket };
}
