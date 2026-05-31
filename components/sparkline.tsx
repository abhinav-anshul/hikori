import { cn } from "@/lib/utils";

export type SparklinePoint = { day: string; clicks: number };

export function Sparkline({
    series,
    width = 64,
    height = 18,
    className,
}: {
    series: SparklinePoint[];
    width?: number;
    height?: number;
    className?: string;
}) {
    if (series.length === 0) {
        return (
            <div
                style={{ width, height }}
                className={cn("shrink-0", className)}
            />
        );
    }

    const max = Math.max(...series.map((p) => p.clicks), 1);
    const stepX = series.length > 1 ? width / (series.length - 1) : 0;

    // Reserve 1px top and bottom so the stroke isn't clipped at extremes.
    const usableH = height - 2;

    const points = series
        .map((p, i) => {
            const x = i * stepX;
            const y = 1 + usableH - (p.clicks / max) * usableH;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={cn("shrink-0 text-muted-foreground", className)}
            aria-hidden
        >
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
