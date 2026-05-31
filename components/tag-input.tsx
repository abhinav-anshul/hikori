"use client";

import { useMemo, useRef, useState, useTransition } from "react";

import { TagChip } from "@/components/tag-chip";
import { Input } from "@/components/ui/input";
import { pickColorFor } from "@/lib/tag-colors";
import {
    createTag,
    type Tag,
} from "@/app/(dashboard)/dashboard/links/action";

const MAX_SUGGESTIONS = 6;
const MAX_TAG_LENGTH = 10;

export function TagInput({
    available,
    initialSelected = [],
}: {
    available: Tag[];
    initialSelected?: Tag[];
}) {
    // Tags the dialog has created during this session, in addition to
    // whatever was passed in via `available`. New tags here get added
    // to suggestions immediately without waiting for a server refresh.
    const [knownTags, setKnownTags] = useState<Tag[]>(available);
    const [selected, setSelected] = useState<Tag[]>(initialSelected);
    const [query, setQuery] = useState("");
    const [creating, startCreate] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedIds = useMemo(
        () => new Set(selected.map((t) => t.id)),
        [selected],
    );

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return knownTags
            .filter((t) => !selectedIds.has(t.id))
            .filter((t) => t.name.toLowerCase().includes(q))
            .slice(0, MAX_SUGGESTIONS);
    }, [query, knownTags, selectedIds]);

    const exactMatch = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return null;
        return (
            knownTags.find((t) => t.name.toLowerCase() === q) ?? null
        );
    }, [query, knownTags]);

    function addTag(tag: Tag) {
        if (selectedIds.has(tag.id)) return;
        setSelected((prev) => [...prev, tag]);
        setQuery("");
        inputRef.current?.focus();
    }

    function removeTag(id: string) {
        setSelected((prev) => prev.filter((t) => t.id !== id));
    }

    function handleEnter() {
        const q = query.trim();
        if (!q) return;

        if (exactMatch) {
            addTag(exactMatch);
            return;
        }
        // Pick the first suggestion if it's a prefix match — slightly
        // more forgiving than requiring exact.
        if (suggestions[0]) {
            addTag(suggestions[0]);
            return;
        }

        // No match → create a new tag on the server.
        startCreate(async () => {
            const result = await createTag(q, pickColorFor(q));
            if (result.tag) {
                setKnownTags((prev) => [...prev, result.tag!]);
                addTag(result.tag);
            }
        });
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleEnter();
        } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
            removeTag(selected[selected.length - 1]!.id);
        }
    }

    return (
        <div className="space-y-2">
            {/* Hidden inputs so the parent <form> sends the selection in submit. */}
            {selected.map((t) => (
                <input
                    key={t.id}
                    type="hidden"
                    name="tag_ids"
                    value={t.id}
                />
            ))}

            <label htmlFor="tag-input" className="block text-sm font-medium">
                Tags
            </label>

            <div className="rounded-md border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring">
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-2 pt-2">
                        {selected.map((t) => (
                            <TagChip
                                key={t.id}
                                tag={t}
                                onRemove={() => removeTag(t.id)}
                            />
                        ))}
                    </div>
                )}
                <Input
                    ref={inputRef}
                    id="tag-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_TAG_LENGTH}
                    placeholder={
                        selected.length === 0
                            ? "Add tags…"
                            : "Add another…"
                    }
                    className="h-8 border-none shadow-none focus-visible:ring-0"
                />
            </div>

            {(suggestions.length > 0 ||
                (query.trim() && !exactMatch)) && (
                <div className="rounded-md border border-border bg-popover p-1 text-sm shadow-md">
                    {suggestions.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => addTag(t)}
                            className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left hover:bg-accent"
                        >
                            <TagChip tag={t} />
                        </button>
                    ))}
                    {query.trim() && !exactMatch && (
                        <button
                            type="button"
                            disabled={creating}
                            onClick={handleEnter}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        >
                            {creating ? "Creating…" : `Create "${query.trim()}"`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
