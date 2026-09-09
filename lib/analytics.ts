// Client-safe. No supabase / next/headers imports here so this
// module can be pulled into "use client" components for types and
// the range list. The server-only fetcher lives in analytics-server.ts.

export type AnalyticsRange =
    | "today"
    | "yesterday"
    | "last_7_days"
    | "last_30_days"
    | "all_time";

export const ANALYTICS_RANGES: { value: AnalyticsRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "all_time", label: "All time" },
];

export const DEFAULT_RANGE: AnalyticsRange = "last_30_days";

export function parseRange(input: string | undefined | null): AnalyticsRange {
    return ANALYTICS_RANGES.some((r) => r.value === input)
        ? (input as AnalyticsRange)
        : DEFAULT_RANGE;
}

export type AnalyticsBucket = "hour" | "day";

export type AnalyticsSeriesPoint = { bucket: string; clicks: number };
export type AnalyticsTopLink = { id: string; slug: string; clicks: number };
export type AnalyticsTopReferrer = { host: string; clicks: number };
export type AnalyticsTopDevice = { device: string; clicks: number };
export type AnalyticsTopCountry = { country: string; clicks: number };
export type AnalyticsTopBrowser = { browser: string; clicks: number };
export type AnalyticsTopOs = { os: string; clicks: number };

export type Analytics = {
    total: number;
    uniques: number;
    series: AnalyticsSeriesPoint[];
    top_links: AnalyticsTopLink[];
    top_referrers: AnalyticsTopReferrer[];
    top_devices: AnalyticsTopDevice[];
    top_countries: AnalyticsTopCountry[];
    top_browsers: AnalyticsTopBrowser[];
    top_os: AnalyticsTopOs[];
    bucket: AnalyticsBucket;
};

export function parseExcludeBots(input: string | undefined | null): boolean {
    return input === "hide";
}

const DAY_MS = 86_400_000;

function startOfUtcDay(d: Date): Date {
    const c = new Date(d);
    c.setUTCHours(0, 0, 0, 0);
    return c;
}

export function rangeBounds(range: AnalyticsRange): {
    from: string | null;
    to: string;
    bucket: AnalyticsBucket;
} {
    const now = new Date();
    const todayStart = startOfUtcDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);

    switch (range) {
        case "today":
            return {
                from: todayStart.toISOString(),
                to: now.toISOString(),
                bucket: "hour",
            };
        case "yesterday":
            return {
                from: yesterdayStart.toISOString(),
                to: todayStart.toISOString(),
                bucket: "hour",
            };
        case "last_7_days":
            return {
                from: new Date(now.getTime() - 7 * DAY_MS).toISOString(),
                to: now.toISOString(),
                bucket: "day",
            };
        case "last_30_days":
            return {
                from: new Date(now.getTime() - 30 * DAY_MS).toISOString(),
                to: now.toISOString(),
                bucket: "day",
            };
        case "all_time":
            return { from: null, to: now.toISOString(), bucket: "day" };
    }
}
