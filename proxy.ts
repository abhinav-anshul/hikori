import { NextResponse, type NextRequest } from "next/server";
import { isAuthRateLimited, isRedirectRateLimited } from "@/lib/rate-limit";
import { refreshSession } from "@/lib/supabase";

const EXEMPT_PATHS = new Set([
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
]);
const AUTH_PATHS = new Set([
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
]);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublicRedirect =
        !pathname.startsWith("/dashboard") &&
        !pathname.startsWith("/auth/") &&
        !EXEMPT_PATHS.has(pathname);

    // Auth forms POST to their own page — that's the server action
    // submission, distinct from the initial page GET — so this is the
    // one place all of them are guaranteed to funnel through.
    const isAuthSubmission =
        request.method === "POST" && AUTH_PATHS.has(pathname);

    if (isPublicRedirect || isAuthSubmission) {
        const xff = request.headers.get("x-forwarded-for");
        const ip = xff?.split(",")[0]?.trim() ?? "unknown";
        const limited = isAuthSubmission
            ? await isAuthRateLimited(ip)
            : await isRedirectRateLimited(ip);
        if (limited) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }
    }

    return refreshSession(request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
