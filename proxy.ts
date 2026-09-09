import { NextResponse, type NextRequest } from "next/server";
import { isRedirectRateLimited } from "@/lib/rate-limit";
import { refreshSession } from "@/lib/supabase";

const EXEMPT_PATHS = new Set(["/", "/login", "/signup"]);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublicRedirect =
        !pathname.startsWith("/dashboard") &&
        !pathname.startsWith("/auth/") &&
        !EXEMPT_PATHS.has(pathname);

    if (isPublicRedirect) {
        const xff = request.headers.get("x-forwarded-for");
        const ip = xff?.split(",")[0]?.trim() ?? "unknown";
        if (await isRedirectRateLimited(ip)) {
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
