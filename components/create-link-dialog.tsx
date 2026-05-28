"use client";

import { useState } from "react";
import { Plus, ArrowRight, RotateCw } from "lucide-react";
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
import { createLink } from "@/app/(dashboard)/dashboard/links/action";

export function CreateLinkDialog({
    children,
}: {
    children?: React.ReactNode;
}) {
    const [slug, setSlug] = useState("");

    const generateSlug = () => {
        setSlug(Math.random().toString(36).slice(2, 9));
    };

    return (
        <Dialog>
            <DialogTrigger
                render={
                    children ? undefined : (
                        <Button className="font-normal">
                            Create link
                            <ArrowRight className="size-4" />
                        </Button>
                    )
                }
            >
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create link</DialogTitle>
                    <DialogDescription>
                        Shorten a URL with a custom or generated slug.
                    </DialogDescription>
                </DialogHeader>

                <form action={createLink} className="space-y-4">
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
                                required
                                className="pr-9"
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

                    <DialogFooter>
                        <Button type="submit" disabled={!slug.trim()} className="font-normal">
                            Create link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
