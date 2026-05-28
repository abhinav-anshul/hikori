"use client";

import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { deleteLink } from "@/app/(dashboard)/dashboard/links/action";

export function LinkRowActions({ id, slug }: { id: string; slug: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/${slug}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!confirm("Delete this link? This cannot be undone.")) {
            e.preventDefault();
        }
    };

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy short link"
                className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {copied ? (
                    <Check className="size-4" />
                ) : (
                    <Copy className="size-4" />
                )}
            </button>
            <form action={deleteLink} onSubmit={handleDeleteSubmit}>
                <input type="hidden" name="id" value={id} />
                <button
                    type="submit"
                    aria-label="Delete link"
                    className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Trash2 className="size-4" />
                </button>
            </form>
        </div>
    );
}
