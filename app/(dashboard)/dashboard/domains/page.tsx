import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainFormDialog } from "@/components/domain-form-dialog";
import { DomainRow, type DomainRowData } from "@/components/domain-row";
import { getAppHost } from "@/lib/app-url";

// Mock data for Step 1 — replaced with real data in Step 2.
const MOCK_DOMAINS: DomainRowData[] = [
    {
        id: "1",
        domain: "links.popclub.co",
        status: "verified",
        verification_token: "8f3k2q9xa1c4d7e8",
        created_at: "2026-05-10T10:00:00Z",
    },
    {
        id: "2",
        domain: "go.example.com",
        status: "pending",
        verification_token: "b2j7n5pq1z3w6v9k",
        created_at: "2026-05-29T14:30:00Z",
    },
    {
        id: "3",
        domain: "r.brand.io",
        status: "failed",
        verification_token: "m4t8s1xy7r2u5o6p",
        created_at: "2026-05-22T09:15:00Z",
    },
];

export default function Domains() {
    const domains = MOCK_DOMAINS;
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
                    {domains.length > 0 ? (
                        <ul className="space-y-3">
                            {domains.map((d) => (
                                <DomainRow key={d.id} domain={d} />
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-lg border border-border bg-card p-12">
                            <div className="mx-auto max-w-sm space-y-4 text-center">
                                <div className="inline-flex items-center rounded-md bg-muted/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                                    <span>go.yourbrand.com</span>
                                    <span className="text-foreground">/abc</span>
                                </div>
                                <div className="space-y-1.5">
                                    <h2 className="text-base font-semibold">
                                        No domains yet
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Connect a custom domain to brand your
                                        short links. Use the{" "}
                                        <span className="font-medium text-foreground">
                                            Add domain
                                        </span>{" "}
                                        button above to get started.
                                    </p>
                                </div>
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
