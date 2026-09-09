import {
    AppWindow,
    ArrowRight,
    BarChart3,
    Globe,
    Laptop,
    Link2,
    MapPin,
    Monitor,
} from "lucide-react";
import Link from "next/link";

import { BotToggle } from "@/components/analytics/bot-toggle";
import { RangeDropdown } from "@/components/analytics/range-dropdown";
import { TimelineChart } from "@/components/analytics/timeline-chart";
import { TopList } from "@/components/analytics/top-list";
import { Badge } from "@/components/ui/badge";
import { parseExcludeBots, parseRange } from "@/lib/analytics";
import { getAnalytics } from "@/lib/analytics-server";

export default async function Analytics({
    searchParams,
}: {
    searchParams: Promise<{ range?: string; bots?: string }>;
}) {
    const sp = await searchParams;
    const range = parseRange(sp.range);
    const excludeBots = parseExcludeBots(sp.bots);
    const data = await getAnalytics(range, { excludeBots });

    const isEmpty = data.total === 0;
    const maxLinkClicks = Math.max(
        ...data.top_links.map((l) => l.clicks),
        1,
    );

    return (
        <section className="space-y-6">
            <div className="space-y-3">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Analytics
                    </h1>
                </header>
                <div className="flex items-center gap-2">
                    <BotToggle excluded={excludeBots} />
                    <RangeDropdown current={range} />
                </div>
            </div>

            {isEmpty ? (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <BarChart3 className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">
                                No data for this range
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Try a wider window, or wait for your links to
                                receive clicks.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <p className="text-xs font-medium text-muted-foreground">
                                Total clicks
                            </p>
                            <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
                                {data.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-6">
                            <p className="text-xs font-medium text-muted-foreground">
                                Unique visitors
                            </p>
                            <p className="mt-1.5 text-lg font-semibold tracking-tight tabular-nums">
                                {data.uniques.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <p className="text-xs font-medium text-muted-foreground">
                            Clicks over time
                        </p>
                        <div className="mt-4">
                            <TimelineChart
                                data={data.series}
                                bucket={data.bucket}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="flex items-center gap-2">
                                <Link2 className="size-4 text-muted-foreground" />
                                <p className="text-xs font-medium text-muted-foreground">
                                    Top links
                                </p>
                            </div>
                            {data.top_links.length === 0 ? (
                                <p className="mt-4 text-xs text-muted-foreground">
                                    No clicks yet.
                                </p>
                            ) : (
                                <ul className="mt-4 space-y-3">
                                    {data.top_links.map((l) => (
                                        <li
                                            key={l.id}
                                            className="space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <p className="truncate text-sm font-medium">
                                                    /{l.slug}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="hover:text-foreground!"
                                                    render={
                                                        <Link
                                                            href={`/dashboard/links/${l.id}`}
                                                        />
                                                    }
                                                >
                                                    <span className="tabular-nums">
                                                        {l.clicks}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ·
                                                    </span>
                                                    View
                                                    <ArrowRight />
                                                </Badge>
                                            </div>
                                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${(l.clicks / maxLinkClicks) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <TopList
                            title="Top referrers"
                            icon={
                                <Globe className="size-4 text-muted-foreground" />
                            }
                            items={data.top_referrers.map((r) => ({
                                key: r.host,
                                label: r.host,
                                clicks: r.clicks,
                            }))}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <TopList
                            title="Top devices"
                            icon={
                                <Laptop className="size-4 text-muted-foreground" />
                            }
                            items={data.top_devices.map((d) => ({
                                key: d.device,
                                label:
                                    d.device.charAt(0).toUpperCase() +
                                    d.device.slice(1),
                                clicks: d.clicks,
                            }))}
                        />
                        <TopList
                            title="Top countries"
                            icon={
                                <MapPin className="size-4 text-muted-foreground" />
                            }
                            items={data.top_countries.map((c) => ({
                                key: c.country,
                                label: c.country,
                                clicks: c.clicks,
                            }))}
                            emptyLabel="No country data yet."
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <TopList
                            title="Top browsers"
                            icon={
                                <AppWindow className="size-4 text-muted-foreground" />
                            }
                            items={data.top_browsers.map((b) => ({
                                key: b.browser,
                                label: b.browser,
                                clicks: b.clicks,
                            }))}
                            emptyLabel="No browser data yet."
                        />
                        <TopList
                            title="Top operating systems"
                            icon={
                                <Monitor className="size-4 text-muted-foreground" />
                            }
                            items={data.top_os.map((o) => ({
                                key: o.os,
                                label: o.os,
                                clicks: o.clicks,
                            }))}
                            emptyLabel="No OS data yet."
                        />
                    </div>
                </>
            )}
        </section>
    );
}
