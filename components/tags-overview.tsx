"use client";

import { Search, Settings2, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ManageTagsDialog } from "@/components/manage-tags-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tagDotClass } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { Tag } from "@/app/(dashboard)/dashboard/links/action";

type TagWithStats = { tag: Tag; linkCount: number; clicks: number };

export function TagsOverview({
    tagsWithStats,
}: {
    tagsWithStats: TagWithStats[];
}) {
    const [query, setQuery] = useState("");
    const [manageOpen, setManageOpen] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return tagsWithStats;
        return tagsWithStats.filter(({ tag }) =>
            tag.name.toLowerCase().includes(q),
        );
    }, [tagsWithStats, query]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tags…"
                        className="h-9 pl-8"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setManageOpen(true)}
                    className="font-normal"
                >
                    <Settings2 className="size-4" />
                    Manage tags
                </Button>
            </div>

            {tagsWithStats.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <TagIcon className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">
                                No tags yet
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Add a tag to a link to see it here.
                            </p>
                        </div>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <Search className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">
                                No matches
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Try a different search term.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                    {filtered.map(({ tag, clicks }) => (
                        <li key={tag.id}>
                            <Link
                                href={`/dashboard/links?tag=${tag.id}`}
                                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className={cn(
                                            "size-2.5 shrink-0 rounded-full",
                                            tagDotClass(tag.color),
                                        )}
                                    />
                                    <span className="truncate text-sm font-medium">
                                        {tag.name}
                                    </span>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                    <span className="tabular-nums">
                                        {clicks}
                                    </span>
                                    {clicks === 1 ? "click" : "clicks"}
                                </Badge>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <ManageTagsDialog
                tags={tagsWithStats.map((t) => t.tag)}
                open={manageOpen}
                onOpenChange={setManageOpen}
            />
        </div>
    );
}
