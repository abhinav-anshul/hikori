import type { ReactNode } from "react";

export type TopListItem = { key: string; label: string; clicks: number };

export function TopList({
    title,
    icon,
    items,
    emptyLabel = "No data yet.",
}: {
    title: string;
    icon: ReactNode;
    items: TopListItem[];
    emptyLabel?: string;
}) {
    const max = Math.max(...items.map((i) => i.clicks), 1);

    return (
        <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2">
                {icon}
                <p className="text-xs font-medium text-muted-foreground">
                    {title}
                </p>
            </div>
            {items.length === 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">
                    {emptyLabel}
                </p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                        <li key={item.key} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                                <p className="truncate text-sm font-medium">
                                    {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground tabular-nums">
                                    {item.clicks}
                                </p>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary"
                                    style={{
                                        width: `${(item.clicks / max) * 100}%`,
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
