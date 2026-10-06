"use server";

import { revalidatePath } from "next/cache";
import { checkDomainOwnership } from "@/lib/domain-check";
import { getServerClient } from "@/lib/supabase";
import { attachDomain, removeDomain } from "@/lib/vercel";

export type DomainStatus = "pending" | "verified" | "failed";

export type Domain = {
    id: string;
    domain: string;
    status: DomainStatus;
    verification_token: string;
    created_at: string;
};

const DOMAIN_COLUMNS = "id, domain, status, verification_token, created_at";

export type DomainResult = { domain?: Domain; error?: string };

export type DomainFormState = {
    error?: string;
    success?: boolean;
};

export async function addDomain(
    _prevState: DomainFormState,
    formData: FormData,
): Promise<DomainFormState> {
    const domain = String(formData.get("domain") ?? "")
        .trim()
        .toLowerCase();
    if (!domain) return { error: "Domain is required." };

    const supabase = await getServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { error } = await supabase
        .from("domains")
        .insert({ user_id: user.id, domain });

    if (error) {
        if (error.code === "23505") return { error: "That domain is already added." };
        return { error: "Could not add domain." };
    }

    revalidatePath("/dashboard/domains");
    return { success: true };
}

export async function verifyDomain(id: string): Promise<DomainResult> {
    if (!id) return { error: "Missing domain id." };

    const supabase = await getServerClient();
    const { data: row, error: fetchError } = await supabase
        .from("domains")
        .select("domain, verification_token")
        .eq("id", id)
        .single();
    if (fetchError || !row) return { error: "Domain not found." };

    const check = await checkDomainOwnership(row.domain, row.verification_token);

    if (!check.verified) {
        // A missing record just means DNS hasn't propagated (or hasn't
        // been added) yet — that's not a hard failure, only a value
        // mismatch is.
        const status: DomainStatus = check.reason === "mismatch" ? "failed" : "pending";
        const { data, error } = await supabase
            .from("domains")
            .update({ status })
            .eq("id", id)
            .select(DOMAIN_COLUMNS)
            .single();
        if (error || !data) return { error: "Could not update domain." };

        revalidatePath("/dashboard/domains");
        return {
            domain: data,
            error:
                status === "failed"
                    ? "TXT record found but the value doesn't match. Double-check it and try again."
                    : "We couldn't find the verification record yet. DNS changes can take a few minutes to propagate.",
        };
    }

    try {
        await attachDomain(row.domain);
    } catch (err) {
        await supabase.from("domains").update({ status: "failed" }).eq("id", id);
        revalidatePath("/dashboard/domains");
        return {
            error:
                err instanceof Error
                    ? err.message
                    : "Verified ownership, but couldn't attach the domain on Vercel.",
        };
    }

    const { data, error } = await supabase
        .from("domains")
        .update({ status: "verified" })
        .eq("id", id)
        .select(DOMAIN_COLUMNS)
        .single();
    if (error || !data) return { error: "Could not update domain." };

    revalidatePath("/dashboard/domains");
    return { domain: data };
}

export async function deleteDomain(id: string): Promise<{ error?: string }> {
    if (!id) return { error: "Missing domain id." };

    const supabase = await getServerClient();
    const { data: row, error: fetchError } = await supabase
        .from("domains")
        .select("domain, status")
        .eq("id", id)
        .single();
    if (fetchError || !row) return { error: "Domain not found." };

    // Only attached (verified) domains were ever registered with
    // Vercel — nothing to remove there for a domain still pending
    // or failed, and calling removeDomain on one would just throw.
    if (row.status === "verified") {
        try {
            await removeDomain(row.domain);
        } catch (err) {
            return {
                error:
                    err instanceof Error
                        ? err.message
                        : "Could not remove domain on Vercel.",
            };
        }
    }

    const { error } = await supabase.from("domains").delete().eq("id", id);
    if (error) return { error: "Could not delete domain." };

    revalidatePath("/dashboard/domains");
    return {};
}
