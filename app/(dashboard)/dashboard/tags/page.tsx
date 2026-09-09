import { TagsOverview } from "@/components/tags-overview";
import type { Tag } from "@/app/(dashboard)/dashboard/links/action";
import { getServerClient } from "@/lib/supabase";

type TagLinkRow = {
    tag_id: string;
    link: { click_count: number } | null;
};

export default async function Tags() {
    const supabase = await getServerClient();

    const [tagsResult, linkTagsResult] = await Promise.all([
        supabase.from("tags").select("id, name, color").order("name"),
        supabase.from("link_tags").select("tag_id, link:links(click_count)"),
    ]);

    const tags = (tagsResult.data ?? []) as Tag[];
    const linkTagRows = (linkTagsResult.data ?? []) as unknown as TagLinkRow[];

    const statsByTag = new Map<string, { linkCount: number; clicks: number }>();
    for (const row of linkTagRows) {
        if (!row.link) continue;
        const stats = statsByTag.get(row.tag_id) ?? { linkCount: 0, clicks: 0 };
        stats.linkCount += 1;
        stats.clicks += row.link.click_count;
        statsByTag.set(row.tag_id, stats);
    }

    const tagsWithStats = tags.map((tag) => ({
        tag,
        ...(statsByTag.get(tag.id) ?? { linkCount: 0, clicks: 0 }),
    }));

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Tags
                </h1>
            </header>

            <TagsOverview tagsWithStats={tagsWithStats} />
        </section>
    );
}
