"use client";

import { Check, Copy, Pencil, QrCode, Trash2 } from "lucide-react";
import { useState } from "react";

import { LinkFormDialog } from "@/components/link-form-dialog";
import { QrCodeDialog } from "@/components/qr-code-dialog";
import {
    deleteLink,
    type Tag,
} from "@/app/(dashboard)/dashboard/links/action";

type LinkSummary = { id: string; slug: string; target_url: string };

const ICON_BUTTON =
    "inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LinkRowActions({
    link,
    availableTags = [],
    initialTags = [],
}: {
    link: LinkSummary;
    availableTags?: Tag[];
    initialTags?: Tag[];
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/${link.slug}`;
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
                className={ICON_BUTTON}
            >
                {copied ? (
                    <Check className="size-4" />
                ) : (
                    <Copy className="size-4" />
                )}
            </button>

            <QrCodeDialog slug={link.slug}>
                <button
                    type="button"
                    aria-label="Show QR code"
                    className={ICON_BUTTON}
                >
                    <QrCode className="size-4" />
                </button>
            </QrCodeDialog>

            <LinkFormDialog
                mode="edit"
                link={link}
                availableTags={availableTags}
                initialTags={initialTags}
            >
                <button
                    type="button"
                    aria-label="Edit link"
                    className={ICON_BUTTON}
                >
                    <Pencil className="size-4" />
                </button>
            </LinkFormDialog>

            <form action={deleteLink} onSubmit={handleDeleteSubmit}>
                <input type="hidden" name="id" value={link.id} />
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
