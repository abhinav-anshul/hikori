"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase";

export async function createLink(formData: FormData) {
    const targetUrl = String(formData.get("destination") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();

    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("links").insert({
        user_id: user.id,
        slug: slug,
        target_url: targetUrl,
    });

    revalidatePath("/dashboard/links");
}

export async function deleteLink(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const supabase = await getServerClient();
    await supabase.from("links").delete().eq("id", id);

    revalidatePath("/dashboard/links");
}
