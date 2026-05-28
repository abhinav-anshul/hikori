import { Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Domains() {
    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
                <Button>
                    <Plus className="size-4" />
                    Add domain
                </Button>
            </header>

            <div className="rounded-lg border border-border bg-card p-12">
                <div className="mx-auto max-w-sm space-y-4 text-center">
                    <Globe className="size-6 mx-auto text-muted-foreground" />
                    <div className="space-y-1.5">
                        <h2 className="text-base font-semibold">No domains yet</h2>
                        <p className="text-xs text-muted-foreground">
                            Connect a custom domain to brand your short links.
                        </p>
                    </div>
                    <Button size="sm">
                        <Plus className="size-4" />
                        Add domain
                    </Button>
                </div>
            </div>
        </section>
    );
}
