import { Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateLinkDialog } from "@/components/create-link-dialog";
import { LinkRowActions } from "@/components/link-row-actions";
import { getServerClient } from "@/lib/supabase";

export default async function Links() {
    const supabase = await getServerClient();
    const { data: links } = await supabase
        .from("links")
        .select("id, slug, target_url, click_count, created_at")
        .order("created_at", { ascending: false });

    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
                <CreateLinkDialog />
            </header>

            {links && links.length > 0 ? (
                <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                    {links.map((link) => (
                        <li
                            key={link.id}
                            className="flex items-center justify-between gap-4 p-4"
                        >
                            <div className="min-w-0 space-y-1">
                                <p className="text-sm font-medium">/{link.slug}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {link.target_url}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <p className="text-xs text-muted-foreground">
                                    {link.click_count} {link.click_count === 1 ? "click" : "clicks"}
                                </p>
                                <LinkRowActions id={link.id} slug={link.slug} />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="rounded-lg border border-border bg-card p-12">
                    <div className="mx-auto max-w-sm space-y-4 text-center">
                        <Link2 className="size-6 mx-auto text-muted-foreground" />
                        <div className="space-y-1.5">
                            <h2 className="text-base font-semibold">No links yet</h2>
                            <p className="text-xs text-muted-foreground">
                                Create your first short link to get started.
                            </p>
                        </div>
                        <CreateLinkDialog>
                            <Button size="sm" className="font-normal">
                                <Plus className="size-4" />
                                Create link
                            </Button>
                        </CreateLinkDialog>
                    </div>
                </div>
            )}
        </section>
    );
}
