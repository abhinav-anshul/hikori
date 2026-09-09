import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get("code");

    if (code) {
        const supabase = await getServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}/dashboard/links`);
        }
    }

    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
            "Could not sign in with Google. Try again.",
        )}`,
    );
}
