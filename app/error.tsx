"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-svh flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <AlertTriangle className="size-6 mx-auto text-destructive" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-destructive">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground">
            An unexpected error occurred. You can retry, or head back home.
          </p>
        </div>
        <Button onClick={() => unstable_retry()}>Try again</Button>
      </div>
    </div>
  );
}
