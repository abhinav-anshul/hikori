import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIX = "/dashboard";
const HOME_PATH = "/dashboard/links";
const AUTH_PATHS = ["/login", "/signup"];

// Use inside pages and Server Actions (e.g. the login() action).
// Reads/writes auth cookies via Next's cookies() API.
export async function getServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (toSet) => {
                    try {
                        for (const { name, value, options } of toSet) {
                            cookieStore.set(name, value, options);
                        }
                    } catch {
                        // Called from a Server Component; proxy handles refresh.
                    }
                },
            },
        },
    );
}

// Use only inside proxy.ts. Refreshes the auth cookie on every request
// and redirects unauth'd users away from protected routes.
export async function refreshSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (toSet) => {
                    for (const { name, value } of toSet) {
                        request.cookies.set(name, value);
                    }
                    response = NextResponse.next({ request });
                    for (const { name, value, options } of toSet) {
                        response.cookies.set(name, value, options);
                    }
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isProtected = pathname.startsWith(PROTECTED_PREFIX);
    const isAuthRoute = AUTH_PATHS.includes(pathname);

    if (!user && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = HOME_PATH;
        return NextResponse.redirect(url);
    }

    return response;
}
