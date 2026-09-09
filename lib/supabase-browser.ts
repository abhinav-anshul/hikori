import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client — for flows that must run in the
// browser (e.g. signInWithOAuth, which redirects the tab itself).
// Kept out of lib/supabase.ts so client components never pull in
// that file's next/headers import.
export function getBrowserClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}
