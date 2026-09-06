"use client";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        <div className="min-h-svh flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-destructive">
                Something went wrong
              </h2>
              <p className="text-xs text-muted-foreground">
                A critical error occurred. Please try again.
              </p>
            </div>
            <button
              onClick={() => unstable_retry()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
