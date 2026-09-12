import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase";

// Where we're allowed to land after a successful code exchange, beyond
// the default dashboard — currently only the password-reset flow needs
// this. Kept as a whitelist so `next` can't be turned into an open redirect.
const ALLOWED_NEXT_PATHS = ["/reset-password"];

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get("code");
    const next = searchParams.get("next");

    if (code) {
        const supabase = await getServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const destination =
                next && ALLOWED_NEXT_PATHS.includes(next)
                    ? next
                    : "/dashboard/links";
            return NextResponse.redirect(`${origin}${destination}`);
        }
    }

    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
            "That link is invalid or has expired. Try again.",
        )}`,
    );
}
