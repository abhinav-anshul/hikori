"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TAG_COLORS, tagDotClass, type TagColor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import {
    deleteTag,
    updateTag,
    type Tag,
} from "@/app/(dashboard)/dashboard/links/action";

const ICON_BUTTON =
    "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ManageTagsDialog({
    tags,
    open,
    onOpenChange,
}: {
    tags: Tag[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    // Seeded from props, then kept in sync locally on every successful
    // mutation — avoids waiting on a full server revalidation round-trip
    // for the row the user just edited to reflect the change.
    const [rows, setRows] = useState<Tag[]>(tags);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [pickingColorId, setPickingColorId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState("");
    const [rowError, setRowError] = useState<{
        id: string;
        message: string;
    } | null>(null);
    const [, startTransition] = useTransition();

    const startEditing = (tag: Tag) => {
        setEditingId(tag.id);
        setDraftName(tag.name);
        setPickingColorId(null);
        setRowError(null);
    };

    const commitName = (tag: Tag) => {
        const trimmed = draftName.trim();
        if (!trimmed || trimmed === tag.name) {
            setEditingId(null);
            return;
        }
        startTransition(async () => {
            const result = await updateTag(tag.id, trimmed, tag.color);
            if (result.error || !result.tag) {
                setRowError({
                    id: tag.id,
                    message: result.error ?? "Could not rename tag.",
                });
                return;
            }
            setRows((prev) =>
                prev.map((t) => (t.id === tag.id ? result.tag! : t)),
            );
            setEditingId(null);
            setRowError(null);
        });
    };

    const setColor = (tag: Tag, color: TagColor) => {
        setPickingColorId(null);
        startTransition(async () => {
            const result = await updateTag(tag.id, tag.name, color);
            if (result.error || !result.tag) {
                setRowError({
                    id: tag.id,
                    message: result.error ?? "Could not change color.",
                });
                return;
            }
            setRows((prev) =>
                prev.map((t) => (t.id === tag.id ? result.tag! : t)),
            );
        });
    };

    const removeTag = (tag: Tag) => {
        if (
            !confirm(
                `Delete "${tag.name}"? It will be removed from any links using it.`,
            )
        ) {
            return;
        }
        setRowError(null);
        startTransition(async () => {
            const result = await deleteTag(tag.id);
            if (result.error) {
                setRowError({ id: tag.id, message: result.error });
                return;
            }
            setRows((prev) => prev.filter((t) => t.id !== tag.id));
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) {
                    setEditingId(null);
                    setPickingColorId(null);
                    setRowError(null);
                }
            }}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Manage tags</DialogTitle>
                    <DialogDescription>
                        Rename or delete tags. Deleting a tag removes it from
                        any links using it.
                    </DialogDescription>
                </DialogHeader>

                {rows.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        No tags yet.
                    </p>
                ) : (
                    <ul className="space-y-1">
                        {rows.map((tag) => (
                            <li
                                key={tag.id}
                                className="relative rounded-md px-1.5 py-1"
                            >
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        aria-label={`Change color for ${tag.name}`}
                                        onClick={() =>
                                            setPickingColorId((prev) =>
                                                prev === tag.id
                                                    ? null
                                                    : tag.id,
                                            )
                                        }
                                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110"
                                    >
                                        <span
                                            className={cn(
                                                "size-2.5 rounded-full",
                                                tagDotClass(tag.color),
                                            )}
                                        />
                                    </button>

                                    {editingId === tag.id ? (
                                        <Input
                                            autoFocus
                                            value={draftName}
                                            onChange={(e) =>
                                                setDraftName(e.target.value)
                                            }
                                            onBlur={() => commitName(tag)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    commitName(tag);
                                                } else if (
                                                    e.key === "Escape"
                                                ) {
                                                    setEditingId(null);
                                                    setRowError(null);
                                                }
                                            }}
                                            maxLength={32}
                                            className="h-7 flex-1"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEditing(tag)}
                                            className="flex-1 truncate rounded-sm px-1 py-1 text-left text-sm hover:bg-accent"
                                        >
                                            {tag.name}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        aria-label={`Rename ${tag.name}`}
                                        onClick={() => startEditing(tag)}
                                        className={ICON_BUTTON}
                                    >
                                        <Pencil className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Delete ${tag.name}`}
                                        onClick={() => removeTag(tag)}
                                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>

                                {rowError?.id === tag.id && (
                                    <p className="mt-1 pl-7 text-xs text-destructive">
                                        {rowError.message}
                                    </p>
                                )}

                                {pickingColorId === tag.id && (
                                    <div className="absolute inset-x-0 top-full z-10 mt-1 flex items-center gap-1.5 rounded-md border border-border bg-popover p-2 shadow-md">
                                        {TAG_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                aria-label={color}
                                                onClick={() =>
                                                    setColor(tag, color)
                                                }
                                                className="inline-flex size-6 items-center justify-center rounded-full hover:bg-accent"
                                            >
                                                <span
                                                    className={cn(
                                                        "size-3 rounded-full",
                                                        tagDotClass(color),
                                                    )}
                                                />
                                                {tag.color === color && (
                                                    <Check className="absolute size-2.5 text-background" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="font-normal"
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
