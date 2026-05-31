"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSlug(len = 6): string {
    let s = "";
    for (let i = 0; i < len; i++) {
        s += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
    }
    return s;
}

function normalizeUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withProto = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    try {
        const url = new URL(withProto);
        if (!url.hostname.includes(".")) return null;
        return url.toString();
    } catch {
        return null;
    }
}

export function ShortenerInput({ host }: { host: string }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const normalized = normalizeUrl(value);
        if (!normalized) {
            setError("Enter a valid URL, e.g. example.com/page");
            setShortUrl(null);
            return;
        }
        setError(null);
        setShortUrl(`${host}/${randomSlug()}`);
        setCopied(false);
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
                className="flex flex-col gap-6"
            >
                <div className="w-full -translate-y-1/2">
                    <Input
                        type="text"
                        inputMode="url"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(null);
                        }}
                        placeholder="Paste a long URL to shorten…"
                        aria-label="URL to shorten"
                        aria-invalid={!!error}
                        className="h-12 rounded-full border-ring bg-background px-4 focus-visible:ring-0"
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    className="-mt-6 self-center rounded-full px-4 hover:ring-3 hover:ring-ring/50"
                >
                    Shorten
                    <ArrowRight className="size-4" />
                </Button>
            </form>

            {error ? (
                <p className="mt-1.5 px-1 text-xs text-destructive">{error}</p>
            ) : null}

            {shortUrl ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                    <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {shortUrl}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        aria-label="Copy short link"
                    >
                        {copied ? (
                            <Check className="size-4 text-primary" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    <Link
                        href="/signup"
                        className={cn(
                            "inline-flex h-8 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80",
                        )}
                    >
                        Claim link
                    </Link>
                </div>
            ) : null}
        </div>
    );
}
