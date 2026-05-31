import { X } from "lucide-react";

import { tagColorClass } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { Tag } from "@/app/(dashboard)/dashboard/links/action";

export function TagChip({
    tag,
    onRemove,
    className,
}: {
    tag: Tag;
    onRemove?: () => void;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                tagColorClass(tag.color),
                className,
            )}
        >
            {tag.name}
            {onRemove && (
                <button
                    type="button"
                    aria-label={`Remove ${tag.name}`}
                    onClick={onRemove}
                    className="rounded-sm hover:bg-black/10 dark:hover:bg-white/10"
                >
                    <X className="size-3" />
                </button>
            )}
        </span>
    );
}
