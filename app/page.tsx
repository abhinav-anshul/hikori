import Link from "next/link";
import { BarChart3, Globe, Link2, Sparkles } from "lucide-react";

import { ShortenerInput } from "@/components/marketing/shortener-input";
import { SquiggleUnderline } from "@/components/marketing/squiggle-underline";
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

            {/* Hero band — soft mint tint, ~70% of the viewport */}
            <div className="flex min-h-[70svh] flex-col rounded-b-[3rem] bg-primary/10 text-foreground">
                <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 md:px-8">
                    {/* Nav */}
                    <nav className="flex h-16 shrink-0 items-center justify-between">
                        <span className="text-lg font-semibold tracking-tight">
                            Hikori
                        </span>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Start free
                            </Link>
                        </div>
                    </nav>

                    {/* Hero copy */}
                    <section className="flex flex-1 flex-col items-center justify-center gap-6 pt-8 pb-28 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium">
                            <Sparkles className="size-3" />
                            Short links, custom domains & analytics
                        </span>

                        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight">
                            Short links that drive{" "}
                            <span className="marker-highlight relative isolate inline-block -rotate-2 px-2 text-primary-foreground">
                                real results
                            </span>
                        </h1>

                        <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
                            Shorten, brand, and{" "}
                            <SquiggleUnderline>track every link</SquiggleUnderline>
                            . Bring your own domain and watch the clicks roll
                            in — with analytics that actually tell you
                            something.
                        </p>
                    </section>
                </div>
            </div>

            {/* Shortener + trust — input straddles the green/white seam */}
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pb-20 text-center md:px-8">
                <ShortenerInput host={host} />

                <p className="text-xs text-muted-foreground">
                    Free forever plan · No credit card required
                </p>

                <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                    <li className="inline-flex items-center gap-2">
                        <Link2 className="size-4" />
                        Branded short links
                    </li>
                    <li className="inline-flex items-center gap-2">
                        <Globe className="size-4" />
                        Custom domains
                    </li>
                    <li className="inline-flex items-center gap-2">
                        <BarChart3 className="size-4" />
                        Click analytics
                    </li>
                </ul>
            </div>
        </main>
    );
}
