"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase";
import { isTagColor } from "@/lib/tag-colors";

export type LinkFormState = {
    error?: string;
    success?: boolean;
};

export type Tag = {
    id: string;
    name: string;
    color: string;
};

const SUCCESS: LinkFormState = { success: true };

function readFields(formData: FormData) {
    return {
        targetUrl: String(formData.get("destination") ?? "").trim(),
        slug: String(formData.get("slug") ?? "").trim(),
        tagIds: formData.getAll("tag_ids").map((v) => String(v)),
    };
}

// Maps a supabase error to a user-facing message. The two errors we
// actually expect from links are 23505 (unique violation, dup slug)
// and 23514 (check constraint, bad slug format or non-http url).
function mapError(code?: string): string {
    if (code === "23505") return "That slug is already taken.";
    if (code === "23514")
        return "Slug must be 1–64 chars (letters, numbers, _ or -) and destination must start with http(s).";
    return "Something went wrong. Try again.";
}

// Replace-set semantics: clears existing link_tags for the link
// and inserts the new set. Caller has already verified the link
// belongs to the user (or it would have failed RLS earlier).
async function syncLinkTags(linkId: string, tagIds: string[]) {
    const supabase = await getServerClient();
    await supabase.from("link_tags").delete().eq("link_id", linkId);
    if (tagIds.length > 0) {
        await supabase
            .from("link_tags")
            .insert(tagIds.map((tag_id) => ({ link_id: linkId, tag_id })));
    }
}

export async function createLink(
    _prevState: LinkFormState,
    formData: FormData,
): Promise<LinkFormState> {
    const { targetUrl, slug, tagIds } = readFields(formData);
    if (!targetUrl || !slug) return { error: "Both fields are required." };

    const supabase = await getServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: inserted, error } = await supabase
        .from("links")
        .insert({ user_id: user.id, slug, target_url: targetUrl })
        .select("id")
        .single();
    if (error || !inserted) return { error: mapError(error?.code) };

    if (tagIds.length > 0) {
        await syncLinkTags(inserted.id, tagIds);
    }

    revalidatePath("/dashboard/links");
    return SUCCESS;
}

export async function updateLink(
    _prevState: LinkFormState,
    formData: FormData,
): Promise<LinkFormState> {
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Missing link id." };

    const { targetUrl, slug, tagIds } = readFields(formData);
    if (!targetUrl || !slug) return { error: "Both fields are required." };

    const supabase = await getServerClient();
    const { error } = await supabase
        .from("links")
        .update({ slug, target_url: targetUrl })
        .eq("id", id);
    if (error) return { error: mapError(error.code) };

    await syncLinkTags(id, tagIds);

    revalidatePath("/dashboard/links");
    return SUCCESS;
}

export async function deleteLink(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await getServerClient();
    await supabase.from("links").delete().eq("id", id);

    revalidatePath("/dashboard/links");
}

export async function archiveLink(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await getServerClient();
    await supabase.from("links").update({ archived: true }).eq("id", id);

    revalidatePath("/dashboard/links");
}

export async function unarchiveLink(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await getServerClient();
    await supabase.from("links").update({ archived: false }).eq("id", id);

    revalidatePath("/dashboard/links");
}

// ------------------- tags ---------------------------------------------

export type CreateTagResult = { tag?: Tag; error?: string };

export async function createTag(
    name: string,
    color: string,
): Promise<CreateTagResult> {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Name required." };
    if (trimmed.length > 32) return { error: "Name too long (max 32)." };
    if (!isTagColor(color)) return { error: "Invalid color." };

    const supabase = await getServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data, error } = await supabase
        .from("tags")
        .insert({ user_id: user.id, name: trimmed, color })
        .select("id, name, color")
        .single();

    if (error) {
        if (error.code === "23505")
            return { error: "Tag with that name already exists." };
        return { error: "Could not create tag." };
    }

    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/tags");
    return { tag: data };
}

export async function updateTag(
    id: string,
    name: string,
    color: string,
): Promise<CreateTagResult> {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Name required." };
    if (trimmed.length > 32) return { error: "Name too long (max 32)." };
    if (!isTagColor(color)) return { error: "Invalid color." };

    const supabase = await getServerClient();
    const { data, error } = await supabase
        .from("tags")
        .update({ name: trimmed, color })
        .eq("id", id)
        .select("id, name, color")
        .single();

    if (error) {
        if (error.code === "23505")
            return { error: "Tag with that name already exists." };
        return { error: "Could not update tag." };
    }

    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/tags");
    return { tag: data };
}

export async function deleteTag(id: string): Promise<{ error?: string }> {
    if (!id) return { error: "Missing tag id." };

    const supabase = await getServerClient();
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) return { error: "Could not delete tag." };

    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/tags");
    return {};
}
