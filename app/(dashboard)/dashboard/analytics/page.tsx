import { BarChart3 } from "lucide-react";

export default function Analytics() {
    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            </header>

            <div className="rounded-lg border border-border bg-card p-12">
                <div className="mx-auto max-w-sm space-y-4 text-center">
                    <BarChart3 className="size-6 mx-auto text-muted-foreground" />
                    <div className="space-y-1.5">
                        <h2 className="text-base font-semibold">No data yet</h2>
                        <p className="text-xs text-muted-foreground">
                            Analytics will appear here once your links start receiving clicks.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
