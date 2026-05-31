import { ArrowLeft, BarChart3, ExternalLink, Globe, Laptop, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BotToggle } from "@/components/analytics/bot-toggle";
import { RangeDropdown } from "@/components/analytics/range-dropdown";
import { TimelineChart } from "@/components/analytics/timeline-chart";
import { TopList } from "@/components/analytics/top-list";
import { parseExcludeBots, parseRange } from "@/lib/analytics";
import { getAnalytics } from "@/lib/analytics-server";
import { getAppHost } from "@/lib/app-url";
import { getServerClient } from "@/lib/supabase";

export default async function LinkAnalytics({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ range?: string; bots?: string }>;
}) {
    const [{ id }, sp] = await Promise.all([params, searchParams]);
    const range = parseRange(sp.range);
    const excludeBots = parseExcludeBots(sp.bots);

    const supabase = await getServerClient();
    const { data: link } = await supabase
        .from("links")
        .select("id, slug, target_url, click_count, created_at")
        .eq("id", id)
        .maybeSingle();

    if (!link) notFound();

    const data = await getAnalytics(range, { linkId: id, excludeBots });
    const host = getAppHost();

    const isEmpty = data.total === 0;

    return (
        <section className="space-y-6">
            <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" />
                Back to analytics
            </Link>

            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl tracking-tight">
                        {host && (
                            <span className="text-muted-foreground">
                                {host}
                            </span>
                        )}
                        <span className="font-semibold">/{link.slug}</span>
                    </h1>
                    <a
                        href={link.target_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <span className="truncate">{link.target_url}</span>
                        <ExternalLink className="size-3 shrink-0" />
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <BotToggle excluded={excludeBots} />
                    <RangeDropdown current={range} />
                </div>
            </header>

            {isEmpty ? (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <BarChart3 className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">
                                No data for this range
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                This link hasn’t received any clicks in the
                                selected window.
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
                            <p className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums">
                                {data.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-6">
                            <p className="text-xs font-medium text-muted-foreground">
                                Unique visitors
                            </p>
                            <p className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums">
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
                </>
            )}
        </section>
    );
}
