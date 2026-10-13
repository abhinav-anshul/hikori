"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";

import { createGuestLink } from "@/app/actions/guest-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { normalizeUrl } from "@/lib/url";

export function ShortenerInput({ host }: { host: string }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState(false);
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [pending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!normalizeUrl(value)) {
            setError(true);
            setShortUrl(null);
            return;
        }
        setError(false);

        startTransition(async () => {
            const result = await createGuestLink(value);
            if ("error" in result) {
                setError(true);
                setShortUrl(null);
                return;
            }
            setShortUrl(`${host}/preview/${result.slug}`);
        });
    }

    async function handleCopy() {
        if (!shortUrl) return;
        try {
            await navigator.clipboard.writeText(`https://${shortUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable — ignore */
        }
    }

    return (
        <div className="w-full max-w-xl">
            <form
                onSubmit={handleSubmit}
                className="grid w-full grid-cols-5 gap-2"
            >
                <div className="relative col-span-4">
                    <Input
                        type="text"
                        inputMode="url"
                        value={shortUrl ?? value}
                        readOnly={!!shortUrl || pending}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(false);
                        }}
                        placeholder="acme.com/long-url"
                        aria-label={
                            shortUrl ? "Your shortened URL" : "URL to shorten"
                        }
                        aria-invalid={error}
                        className="h-12 w-full rounded-full border-border bg-background px-4 font-medium focus-visible:ring-0 placeholder:text-muted-foreground/70 placeholder:font-normal"
                        style={shortUrl ? { paddingRight: "2.5rem" } : undefined}
                    />
                    {shortUrl ? (
                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy short link"
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {copied ? (
                                <Check className="size-4 text-primary" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </button>
                    ) : null}
                </div>
                <Button
                    type={shortUrl ? undefined : "submit"}
                    disabled={pending}
                    render={shortUrl ? <Link href="/signup" /> : undefined}
                    className="col-span-1 flex h-12 cursor-pointer items-center justify-center rounded-full px-2 hover:bg-primary hover:ring-3 hover:ring-ring/50"
                >
                    {shortUrl ? (
                        "Get Access"
                    ) : pending ? (
                        <Spinner className="size-4" />
                    ) : (
                        <>
                            Track
                            <span className="relative ml-1 flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-current" />
                            </span>
                        </>
                    )}
                </Button>
            </form>

            <p className="mt-3 px-4 text-left text-xs text-muted-foreground">
                $19 once for lifetime access
            </p>
        </div>
    );
}
