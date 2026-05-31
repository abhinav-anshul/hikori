"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ANALYTICS_RANGES,
    DEFAULT_RANGE,
    type AnalyticsRange,
} from "@/lib/analytics";

export function RangeDropdown({ current }: { current: AnalyticsRange }) {
    const router = useRouter();
    const currentLabel =
        ANALYTICS_RANGES.find((r) => r.value === current)?.label ?? "";

    const select = (range: AnalyticsRange) => {
        const href = range === DEFAULT_RANGE ? "?" : `?range=${range}`;
        router.push(href, { scroll: false });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {currentLabel}
                <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {ANALYTICS_RANGES.map((r) => (
                    <DropdownMenuItem
                        key={r.value}
                        onClick={() => select(r.value)}
                        className="justify-between"
                    >
                        <span>{r.label}</span>
                        {r.value === current && (
                            <Check className="size-3.5 text-muted-foreground" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
