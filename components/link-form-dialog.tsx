"use client";

import { ArrowRight, RotateCw } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { TagInput } from "@/components/tag-input";
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
    createLink,
    updateLink,
    type LinkFormState,
    type Tag,
} from "@/app/(dashboard)/dashboard/links/action";

type LinkSummary = { id: string; slug: string; target_url: string };

const INITIAL_STATE: LinkFormState = {};

const SLUG_PATTERN = "[a-zA-Z0-9_\\-]{1,64}";

export function LinkFormDialog({
    mode = "create",
    link,
    availableTags = [],
    initialTags = [],
    children,
}: {
    mode?: "create" | "edit";
    link?: LinkSummary;
    availableTags?: Tag[];
    initialTags?: Tag[];
    children?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [slug, setSlug] = useState(link?.slug ?? "");

    const action = mode === "edit" ? updateLink : createLink;
    const [state, formAction, pending] = useActionState<LinkFormState, FormData>(
        action,
        INITIAL_STATE,
    );

    // Reset the slug field whenever the dialog opens so a stale edit
    // doesn't survive a cancel.
    useEffect(() => {
        if (open) setSlug(link?.slug ?? "");
    }, [open, link?.slug]);

    // Close the dialog once the action returns success.
    useEffect(() => {
        if (state.success && open) setOpen(false);
    }, [state.success, open]);

    const generateSlug = () =>
        setSlug(Math.random().toString(36).slice(2, 9));

    const isEdit = mode === "edit";
    const submitLabel = pending
        ? isEdit
            ? "Saving…"
            : "Creating…"
        : isEdit
            ? "Save changes"
            : "Create link";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    (children as React.ReactElement | undefined) ?? (
                        <Button className="font-normal">
                            Create link
                            <ArrowRight className="size-4" />
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit link" : "Create link"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Change the destination or the slug."
                            : "Shorten a URL with a custom or generated slug."}
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                    {isEdit && link && (
                        <input type="hidden" name="id" value={link.id} />
                    )}

                    <div>
                        <label
                            htmlFor="destination"
                            className="block text-sm font-medium mb-2"
                        >
                            Destination URL
                        </label>
                        <Input
                            id="destination"
                            name="destination"
                            type="url"
                            defaultValue={link?.target_url}
                            placeholder="https://example.com/very/long/path"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="slug"
                            className="block text-sm font-medium mb-2"
                        >
                            Slug
                        </label>
                        <div className="relative">
                            <Input
                                id="slug"
                                name="slug"
                                type="text"
                                placeholder="my-link"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                pattern={SLUG_PATTERN}
                                required
                                className="pr-8"
                            />
                            <button
                                type="button"
                                onClick={generateSlug}
                                aria-label="Generate random slug"
                                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <RotateCw className="size-4" />
                            </button>
                        </div>
                    </div>

                    <TagInput
                        key={`${link?.id ?? "new"}-${open ? "o" : "c"}`}
                        available={availableTags}
                        initialSelected={initialTags}
                    />

                    {state.error && (
                        <p className="text-xs text-destructive">
                            {state.error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!slug.trim() || pending}
                            className="font-normal"
                        >
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
