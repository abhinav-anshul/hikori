import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-svh flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <FileQuestion className="size-6 mx-auto text-muted-foreground" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Not found</h2>
          <p className="text-xs text-muted-foreground">
            We couldn&apos;t find the page you were looking for.
          </p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
          Return home
        </Link>
      </div>
    </div>
  );
}
