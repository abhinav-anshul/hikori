import Link from "next/link";
import { BarChart3, Link2, Timer } from "lucide-react";

import { ShortenerInput } from "@/components/marketing/shortener-input";
import { SquiggleUnderline } from "@/components/marketing/squiggle-underline";
import {
    AvatarStack,
    DotTimeline,
    Sparkline,
    StatCard,
} from "@/components/marketing/stat-card";
import { getAppHost } from "@/lib/app-url";

export default function Page() {
    const host = getAppHost() || "hikori.co";

    return (
        <main id="main" className="relative min-h-svh bg-background">
            {/* Brand name revealed in the overscroll area above the navbar */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 flex h-40 -translate-y-full items-end justify-center pb-5 text-2xl font-semibold tracking-tight text-foreground"
            >
                Hikori
            </div>

            {/* Hero band */}
            <div className="flex flex-col text-foreground">
                <div className="mx-auto flex w-full max-w-5xl flex-col px-6 md:px-8">
                    {/* Nav */}
                    <nav className="flex h-16 shrink-0 items-center justify-between">
                        <span className="text-lg font-semibold tracking-tight">
                            Hikori
                        </span>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="inline-flex h-9 items-center rounded-full border border-border px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="inline-flex h-9 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Buy for $19
                            </Link>
                        </div>
                    </nav>

                    {/* Hero copy */}
                    <section className="flex flex-col items-start gap-6 pt-16 pb-12 text-left">
                        <h1 className="font-display max-w-2xl text-balance text-4xl leading-[1.1] font-normal tracking-normal">
                            Track{" "}
                            <SquiggleUnderline>Everything</SquiggleUnderline>
                        </h1>

                        <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                            Shorten, brand, and track every link. Bring your
                            own domain and watch the clicks roll
                            in — with analytics that actually tell you
                            something.
                        </p>
                    </section>
                </div>
            </div>

            {/* Shortener + trust */}
            <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 pb-20 text-left md:px-8">
                <ShortenerInput host={host} />

                <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={BarChart3}
                        label="Since launch"
                        value="1M+"
                        caption="Total clicks"
                    >
                        <Sparkline />
                    </StatCard>
                    <StatCard
                        icon={Link2}
                        label="All time"
                        value="50K+"
                        caption="Links shortened"
                    >
                        <AvatarStack />
                    </StatCard>
                    <StatCard
                        icon={Timer}
                        label="Per redirect"
                        value="<50ms"
                        caption="Redirect speed"
                    >
                        <DotTimeline />
                    </StatCard>
                </div>
            </div>
        </main>
    );
}
