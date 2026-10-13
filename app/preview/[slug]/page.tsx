import { notFound, redirect } from "next/navigation";

import { getServerClient } from "@/lib/supabase";

export default async function GuestLinkRedirect({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const supabase = await getServerClient();
    const { data: targetUrl } = await supabase.rpc("resolve_guest_link", {
        p_slug: slug,
    });

    if (!targetUrl) notFound();
    redirect(targetUrl);
}
