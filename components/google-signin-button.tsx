"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/supabase-browser";

export function GoogleSignInButton() {
    const [pending, setPending] = useState(false);

    const handleClick = async () => {
        setPending(true);
        const supabase = getBrowserClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        // On success the browser navigates away to Google immediately —
        // this only runs if the request itself failed to kick off.
        if (error) setPending(false);
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full font-normal"
            disabled={pending}
            onClick={handleClick}
        >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.82-.07-1.42-.22-2.04H12v3.86h6.5c-.13 1.03-.84 2.6-2.42 3.65l-.02.15 3.52 2.7.24.02c2.24-2.05 3.67-5.07 3.67-8.34Z"
                />
                <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.06 7.93-2.87l-3.78-2.92c-1 .69-2.36 1.15-4.15 1.15-3.16 0-5.84-2.06-6.8-4.92l-.14.01-3.66 2.83-.05.13C3.36 21.3 7.34 24 12 24Z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.2 14.44a7.1 7.1 0 0 1-.39-2.44c0-.85.15-1.67.38-2.44l-.01-.16-3.7-2.87-.12.06A11.94 11.94 0 0 0 0 12c0 1.93.47 3.76 1.36 5.4l3.84-2.96Z"
                />
                <path
                    fill="#EA4335"
                    d="M12 4.75c2.26 0 3.78.97 4.65 1.79l3.4-3.3C17.94 1.2 15.24 0 12 0 7.34 0 3.36 2.7 1.36 6.6l3.83 2.97c.97-2.86 3.65-4.82 6.81-4.82Z"
                />
            </svg>
            {pending ? "Redirecting…" : "Continue with Google"}
        </Button>
    );
}
