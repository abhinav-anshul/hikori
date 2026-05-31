"use client";

import { Bot } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";

export function BotToggle({ excluded }: { excluded: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const toggle = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (excluded) {
            params.delete("bots");
        } else {
            params.set("bots", "hide");
        }
        const qs = params.toString();
        router.push(qs ? `?${qs}` : "?", { scroll: false });
    };

    return (
        <Badge
            variant={excluded ? "secondary" : "outline"}
            className="hover:text-foreground! cursor-pointer"
            render={<button type="button" onClick={toggle} />}
        >
            <Bot />
            {excluded ? "Bots hidden" : "Hide bots"}
        </Badge>
    );
}
