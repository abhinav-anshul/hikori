"use client";

import { Check, ChevronDown, Tag as TagIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { TagChip } from "@/components/tag-chip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tagDotClass } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { Tag } from "@/app/(dashboard)/dashboard/links/action";

export function TagFilter({
    tags,
    current,
}: {
    tags: Tag[];
    current: string | null;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const select = (tagId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tagId) params.set("tag", tagId);
        else params.delete("tag");
        const qs = params.toString();
        router.push(qs ? `?${qs}` : "?", { scroll: false });
    };

    const currentTag = current
        ? tags.find((t) => t.id === current) ?? null
        : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {currentTag ? (
                    <>
                        <span
                            className={cn(
                                "size-2 rounded-full",
                                tagDotClass(currentTag.color),
                            )}
                        />
                        <span className="text-foreground">
                            {currentTag.name}
                        </span>
                    </>
                ) : (
                    <>
                        <TagIcon className="size-3" />
                        All tags
                    </>
                )}
                <ChevronDown className="size-3" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem
                    onClick={() => select(null)}
                    className="justify-between"
                >
                    <span className="text-sm">All links</span>
                    {!current && (
                        <Check className="size-3.5 text-muted-foreground" />
                    )}
                </DropdownMenuItem>

                {tags.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No tags yet.
                    </div>
                ) : (
                    tags.map((t) => (
                        <DropdownMenuItem
                            key={t.id}
                            onClick={() => select(t.id)}
                            className="justify-between"
                        >
                            <TagChip tag={t} />
                            {t.id === current && (
                                <Check className="size-3.5 text-muted-foreground" />
                            )}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
