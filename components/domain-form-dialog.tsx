"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

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

const DOMAIN_PATTERN =
    "^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$";

export function DomainFormDialog({
    children,
}: {
    children?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [domain, setDomain] = useState("");

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
                        Use your own domain for short links. You'll add DNS
                        records to verify ownership and route traffic.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        setDomain("");
                    }}
                    className="space-y-4"
                >
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
                            — apex domains aren't supported yet.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!domain.trim()}
                            className="font-normal"
                        >
                            Add domain
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
