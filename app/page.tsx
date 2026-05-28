import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <main className="min-h-svh flex items-center justify-center px-6">
      <section className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">Hikori</h1>
          <p className="text-sm text-muted-foreground">
            Short links, custom domains, and analytics.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
            Login
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "outline" }))}>
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
