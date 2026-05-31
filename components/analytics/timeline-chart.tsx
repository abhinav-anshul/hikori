"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { AnalyticsBucket } from "@/lib/analytics";

const config = {
    clicks: {
        label: "Clicks",
        color: "var(--primary)",
    },
} satisfies ChartConfig;

function formatTick(value: string, bucket: AnalyticsBucket) {
    const d = new Date(value);
    if (bucket === "hour") {
        return d.toLocaleTimeString("en", {
            hour: "numeric",
            hour12: true,
        });
    }
    return d.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
    });
}

function formatTooltipLabel(value: string, bucket: AnalyticsBucket) {
    const d = new Date(value);
    if (bucket === "hour") {
        return d.toLocaleString("en", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
        });
    }
    return d.toLocaleDateString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

export function TimelineChart({
    data,
    bucket,
}: {
    data: { bucket: string; clicks: number }[];
    bucket: AnalyticsBucket;
}) {
    return (
        <ChartContainer config={config} className="h-48 w-full">
            <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(v: string) => formatTick(v, bucket)}
                />
                <YAxis hide allowDecimals={false} />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            labelFormatter={(_, payload) =>
                                formatTooltipLabel(
                                    payload?.[0]?.payload?.bucket ?? "",
                                    bucket,
                                )
                            }
                            indicator="line"
                        />
                    }
                />
                <Area
                    dataKey="clicks"
                    type="monotone"
                    stroke="var(--color-clicks)"
                    strokeWidth={2}
                    fill="var(--color-clicks)"
                    fillOpacity={0.12}
                />
            </AreaChart>
        </ChartContainer>
    );
}
