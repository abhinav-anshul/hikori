import { CornerDownRight, Link2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LinkFormDialog } from "@/components/link-form-dialog";
import { DestinationFavicon } from "@/components/destination-favicon";
import { LinkRowActions } from "@/components/link-row-actions";
import { Sparkline, type SparklinePoint } from "@/components/sparkline";
import { TagChip } from "@/components/tag-chip";
import { TagFilter } from "@/components/tag-filter";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/app/(dashboard)/dashboard/links/action";
import { getAppHost } from "@/lib/app-url";
import { getServerClient } from "@/lib/supabase";
import { timeAgo } from "@/lib/time";

const SPARKLINE_DAYS = 7;
const MAX_INLINE_TAGS = 3;

type SparkRow = { link_id: string; day: string; clicks: number };

// Pivots the flat rows into a Map<link_id, 7-point zero-filled series>.
// We anchor on today (UTC) to match the SQL's date_trunc('day', ...) ::date.
function buildSparklineMap(
    rows: SparkRow[],
    days: number,
): Map<string, SparklinePoint[]> {
    const out = new Map<string, SparklinePoint[]>();
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    // Pre-build the day axis once.
    const axis: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86_400_000);
        axis.push(d.toISOString().slice(0, 10));
    }

    const byLink = new Map<string, Map<string, number>>();
    for (const r of rows) {
        if (!byLink.has(r.link_id)) byLink.set(r.link_id, new Map());
        byLink.get(r.link_id)!.set(r.day, Number(r.clicks));
    }

    for (const [linkId, dayMap] of byLink) {
        out.set(
            linkId,
            axis.map((day) => ({ day, clicks: dayMap.get(day) ?? 0 })),
        );
    }
    return out;
}

type LinkTagRow = { link_id: string; tag: Tag | null };

export default async function Links({
    searchParams,
}: {
    searchParams: Promise<{ tag?: string }>;
}) {
    const { tag: filterTagId = null } = await searchParams;

    const supabase = await getServerClient();

    // If a tag filter is set, resolve the matching link_ids first so
    // we can constrain the main links query. Cheap — single indexed
    // lookup on link_tags.tag_id.
    let linkIdFilter: string[] | null = null;
    if (filterTagId) {
        const { data } = await supabase
            .from("link_tags")
            .select("link_id")
            .eq("tag_id", filterTagId);
        linkIdFilter = (data ?? []).map((r) => r.link_id);
    }

    let linksQuery = supabase
        .from("links")
        .select("id, slug, target_url, click_count, created_at")
        .order("created_at", { ascending: false });
    if (linkIdFilter) {
        linksQuery = linksQuery.in(
            "id",
            linkIdFilter.length > 0 ? linkIdFilter : ["__none__"],
        );
    }

    const [linksResult, sparklinesResult, tagsResult, linkTagsResult] =
        await Promise.all([
            linksQuery,
            supabase.rpc("get_link_sparklines", { p_days: SPARKLINE_DAYS }),
            supabase
                .from("tags")
                .select("id, name, color")
                .order("name"),
            supabase
                .from("link_tags")
                .select("link_id, tag:tags(id, name, color)"),
        ]);

    const links = linksResult.data;
    const sparkRows = (sparklinesResult.data ?? []) as SparkRow[];
    const sparklines = buildSparklineMap(sparkRows, SPARKLINE_DAYS);

    const availableTags = (tagsResult.data ?? []) as Tag[];
    const linkTagRows = (linkTagsResult.data ?? []) as unknown as LinkTagRow[];

    const tagsByLink = new Map<string, Tag[]>();
    for (const row of linkTagRows) {
        if (!row.tag) continue;
        if (!tagsByLink.has(row.link_id)) tagsByLink.set(row.link_id, []);
        tagsByLink.get(row.link_id)!.push(row.tag);
    }

    const host = getAppHost();

    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
                <div className="flex items-center gap-2">
                    <TagFilter tags={availableTags} current={filterTagId} />
                    <LinkFormDialog availableTags={availableTags} />
                </div>
            </header>

            {links && links.length > 0 ? (
                <ul className="space-y-3">
                    {links.map((link) => {
                        const linkTags = tagsByLink.get(link.id) ?? [];
                        const visibleTags = linkTags.slice(0, MAX_INLINE_TAGS);
                        const extraTagCount = linkTags.length - visibleTags.length;
                        return (
                        <li
                            key={link.id}
                            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                        >
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <Link
                                        href={`/dashboard/links/${link.id}`}
                                        className="text-sm underline-offset-4 hover:underline"
                                    >
                                        {host && (
                                            <span className="text-muted-foreground">
                                                {host}
                                            </span>
                                        )}
                                        <span className="font-medium text-foreground">
                                            /{link.slug}
                                        </span>
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                        · {timeAgo(link.created_at)}
                                    </span>
                                    {visibleTags.map((t) => (
                                        <TagChip key={t.id} tag={t} />
                                    ))}
                                    {extraTagCount > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            +{extraTagCount}
                                        </span>
                                    )}
                                </div>
                                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                    <CornerDownRight className="size-3 shrink-0" />
                                    <DestinationFavicon
                                        url={link.target_url}
                                        size={14}
                                    />
                                    <span className="truncate">
                                        {link.target_url}
                                    </span>
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-4">
                                <Sparkline
                                    series={sparklines.get(link.id) ?? []}
                                />
                                <Badge variant="secondary">
                                    <span className="tabular-nums">
                                        {link.click_count}
                                    </span>
                                    {link.click_count === 1 ? "click" : "clicks"}
                                </Badge>
                                <LinkRowActions
                                    link={{
                                        id: link.id,
                                        slug: link.slug,
                                        target_url: link.target_url,
                                    }}
                                    availableTags={availableTags}
                                    initialTags={linkTags}
                                />
                            </div>
                        </li>
                        );
                    })}
                </ul>
            ) : filterTagId ? (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <Link2 className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">
                                No links match this tag
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Try clearing the filter or applying this tag
                                to an existing link.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/links"
                            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Clear filter
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <Link2 className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">No links yet</h2>
                            <p className="text-xs text-muted-foreground">
                                Create your first short link to get started.
                            </p>
                        </div>
                        <LinkFormDialog availableTags={availableTags}>
                            <Button size="sm" className="font-normal">
                                <Plus className="size-4" />
                                Create link
                            </Button>
                        </LinkFormDialog>
                    </div>
                </div>
            )}
        </section>
    );
}
