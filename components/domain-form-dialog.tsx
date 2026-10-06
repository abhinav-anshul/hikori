"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    addDomain,
    type DomainFormState,
} from "@/app/(dashboard)/dashboard/domains/action";

const DOMAIN_PATTERN =
    "^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$";

const INITIAL_STATE: DomainFormState = {};

export function DomainFormDialog({
    children,
}: {
    children?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [domain, setDomain] = useState("");
    const [state, formAction, pending] = useActionState<DomainFormState, FormData>(
        addDomain,
        INITIAL_STATE,
    );

    // Reset the field whenever the dialog opens so a stale value
    // doesn't survive a cancel.
    useEffect(() => {
        if (open) setDomain("");
    }, [open]);

    // Close the dialog once the action returns success.
    useEffect(() => {
        if (state.success && open) setOpen(false);
    }, [state.success, open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    (children as React.ReactElement | undefined) ?? (
                        <Button className="font-normal">
                            Add domain
                            <ArrowRight className="size-4" />
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a custom domain</DialogTitle>
                    <DialogDescription>
                        Use your own domain for short links. You&apos;ll add
                        DNS records to verify ownership and route traffic.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                    <div>
                        <label
                            htmlFor="domain"
                            className="block text-sm font-medium mb-2"
                        >
                            Domain
                        </label>
                        <Input
                            id="domain"
                            name="domain"
                            type="text"
                            placeholder="go.example.com"
                            value={domain}
                            onChange={(e) =>
                                setDomain(e.target.value.trim().toLowerCase())
                            }
                            pattern={DOMAIN_PATTERN}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                            Use a subdomain like{" "}
                            <span className="font-mono">go.example.com</span>{" "}
                            — apex domains aren&apos;t supported yet.
                        </p>
                    </div>

                    {state.error && (
                        <p className="text-xs text-destructive">
                            {state.error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!domain.trim() || pending}
                            className="font-normal"
                        >
                            {pending ? "Adding…" : "Add domain"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
