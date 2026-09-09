"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LinkStatusFilter({
    current,
}: {
    current: "active" | "archived";
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const select = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === "active") params.delete("status");
        else params.set("status", status);
        const qs = params.toString();
        router.push(qs ? `?${qs}` : "?", { scroll: false });
    };

    return (
        <Tabs value={current} onValueChange={(v) => select(String(v))}>
            <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
