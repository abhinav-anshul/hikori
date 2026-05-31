"use client";

import {
    AlertTriangle,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    RotateCw,
    Settings,
    Trash2,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/time";

export type DomainStatus = "pending" | "verified" | "failed";

export type DomainRowData = {
    id: string;
    domain: string;
    status: DomainStatus;
    verification_token: string;
    created_at: string;
};

const ICON_BUTTON =
    "inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const CNAME_TARGET = "cname.hikori.app";

function StatusBadge({ status }: { status: DomainStatus }) {
    if (status === "verified") {
        return (
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-3" />
                Verified
            </Badge>
        );
    }
    if (status === "failed") {
        return (
            <Badge variant="destructive">
                <AlertTriangle className="size-3" />
                Failed
            </Badge>
        );
    }
    return (
        <Badge variant="secondary">
            <Clock className="size-3" />
            Pending
        </Badge>
    );
}

function CopyValue({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex items-center gap-1 min-w-0">
            <code className="truncate min-w-0 font-mono text-xs">
                {value}
            </code>
            <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy ${label}`}
                className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {copied ? (
                    <Check className="size-3" />
                ) : (
                    <Copy className="size-3" />
                )}
            </button>
        </div>
    );
}

export function DomainRow({ domain }: { domain: DomainRowData }) {
    const [open, setOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const txtName = `_hikori.${domain.domain}`;
    const txtValue = `hikori-verify=${domain.verification_token}`;

    const handleVerify = () => {
        setVerifying(true);
        setTimeout(() => setVerifying(false), 1200);
    };

    const handleDelete = () => {
        if (!confirm(`Delete ${domain.domain}? This cannot be undone.`)) return;
    };

    const createdLabel = timeAgo(domain.created_at);

    return (
        <li className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium">
                            {domain.domain}
                        </span>
                        <StatusBadge status={domain.status} />
                        <span className="text-xs text-muted-foreground">
                            · Added {createdLabel}
                        </span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {domain.status !== "verified" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="font-normal"
                            onClick={handleVerify}
                            disabled={verifying}
                        >
                            {verifying ? (
                                <>
                                    <RotateCw className="size-4 animate-spin" />
                                    Checking…
                                </>
                            ) : domain.status === "failed" ? (
                                <>
                                    <RotateCw className="size-4" />
                                    Retry
                                </>
                            ) : (
                                "Verify"
                            )}
                        </Button>
                    )}
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? "Hide settings" : "Show settings"}
                        aria-expanded={open}
                        className={ICON_BUTTON}
                    >
                        <Settings
                            className={`size-4 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        aria-label="Delete domain"
                        className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            {open && (
                <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold">DNS records</h3>
                        <p className="text-xs text-muted-foreground">
                            Add these records at your domain registrar. DNS
                            changes can take a few minutes to propagate.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-md bg-muted/50 p-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-foreground">
                                    TXT
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Verifies ownership
                                </span>
                            </div>
                            <div className="grid gap-x-2 gap-y-0.5 sm:grid-cols-[120px_1fr] items-center">
                                <span className="text-xs text-muted-foreground">
                                    Name
                                </span>
                                <CopyValue value={txtName} label="TXT name" />
                                <span className="text-xs text-muted-foreground">
                                    Value
                                </span>
                                <CopyValue value={txtValue} label="TXT value" />
                            </div>
                        </div>

                        <div className="rounded-md bg-muted/50 p-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-foreground">
                                    CNAME
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Routes traffic to Hikori
                                </span>
                            </div>
                            <div className="grid gap-x-2 gap-y-0.5 sm:grid-cols-[120px_1fr] items-center">
                                <span className="text-xs text-muted-foreground">
                                    Name
                                </span>
                                <CopyValue
                                    value={domain.domain}
                                    label="CNAME name"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Target
                                </span>
                                <CopyValue
                                    value={CNAME_TARGET}
                                    label="CNAME target"
                                />
                            </div>
                        </div>
                    </div>

                    {domain.status === "failed" && (
                        <p className="text-xs text-destructive">
                            We couldn't find the verification record. Double-check
                            the values above and try again.
                        </p>
                    )}
                </div>
            )}
        </li>
    );
}
