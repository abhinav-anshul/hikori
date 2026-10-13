import type { LucideIcon } from "lucide-react";

export function StatCard({
    icon: Icon,
    label,
    value,
    caption,
    children,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    caption: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-6 text-left">
            <div className="flex items-center justify-between">
                <span className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground">
                    <Icon className="size-3.5" />
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>

            <div className="mt-6 h-16">{children}</div>

            <div className="mt-6 space-y-1">
                <p className="font-display text-3xl leading-none">{value}</p>
                <p className="text-xs text-muted-foreground">{caption}</p>
            </div>
        </div>
    );
}

export function Sparkline() {
    return (
        <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="h-full w-full text-muted-foreground"
            aria-hidden
        >
            <polyline
                points="0,34 16,26 32,27 48,15 64,17 82,6 100,3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function AvatarStack() {
    const initials = ["N", "B", "S"];
    return (
        <div className="flex h-full items-end">
            <div className="flex -space-x-2">
                {initials.map((letter) => (
                    <span
                        key={letter}
                        className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground"
                    >
                        {letter}
                    </span>
                ))}
                <span className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-medium text-primary-foreground">
                    +
                </span>
            </div>
        </div>
    );
}

export function DotTimeline() {
    const filled = [false, false, true, true, true];
    return (
        <div className="flex h-full flex-col justify-end gap-2">
            <div className="relative flex items-center justify-between">
                <span className="absolute inset-x-0 h-px bg-border" />
                {filled.map((isFilled, i) => (
                    <span
                        key={i}
                        className={
                            isFilled
                                ? "relative size-2 rounded-full bg-foreground"
                                : "relative size-2 rounded-full bg-border"
                        }
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>5 min</span>
            </div>
        </div>
    );
}
