import { AlertTriangle, Check, Globe, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainFormDialog } from "@/components/domain-form-dialog";
import { DomainRow, type DomainRowData } from "@/components/domain-row";
import { getAppHost } from "@/lib/app-url";
import { getServerClient } from "@/lib/supabase";

export default async function Domains() {
    const supabase = await getServerClient();
    const { data, error } = await supabase
        .from("domains")
        .select("id, domain, status, verification_token, created_at")
        .order("created_at", { ascending: false });
    const domains = data as DomainRowData[] | null;

    const defaultHost = getAppHost() || "hikori.app";

    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Domains
                </h1>
                <DomainFormDialog>
                    <Button className="font-normal">
                        <Plus className="size-4" />
                        Add domain
                    </Button>
                </DomainFormDialog>
            </header>

            <Tabs defaultValue="custom">
                <TabsList variant="line">
                    <TabsTrigger value="custom">Custom domain</TabsTrigger>
                    <TabsTrigger value="default">Default domain</TabsTrigger>
                </TabsList>

                <TabsContent value="custom">
                    {error ? (
                        <div className="rounded-lg border border-border bg-card p-12">
                            <div className="mx-auto max-w-sm space-y-4 text-center">
                                <AlertTriangle className="size-6 mx-auto text-destructive" />
                                <div className="space-y-1.5">
                                    <h2 className="text-base font-semibold text-destructive">
                                        Couldn&apos;t load domains
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Something went wrong fetching your
                                        domains. Try refreshing the page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : domains && domains.length > 0 ? (
                        <ul className="space-y-3">
                            {domains.map((d) => (
                                <DomainRow key={d.id} domain={d} />
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-lg border border-border bg-card p-12">
                            <div className="mx-auto max-w-sm space-y-4 text-center">
                                <Globe className="size-6 mx-auto text-muted-foreground" />
                                <div className="space-y-1.5">
                                    <h2 className="text-base font-semibold">
                                        No domains yet
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Connect a custom domain to brand your
                                        short links.
                                    </p>
                                </div>
                                <DomainFormDialog>
                                    <Button size="sm" className="font-normal">
                                        <Plus className="size-4" />
                                        Add domain
                                    </Button>
                                </DomainFormDialog>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="default">
                    <div className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-sm font-medium">
                                        {defaultHost}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Check className="size-3" />
                                        Active
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    The default short-link domain on every Hikori
                                    account. Always available.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}
