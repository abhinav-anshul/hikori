import { MailCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBaseUrl } from "@/lib/app-url";
import { getServerClient } from "@/lib/supabase";

export default async function Signup({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; sent?: string }>;
}) {
    const { error, sent } = await searchParams;

    async function signUp(formData: FormData) {
        "use server";

        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const supabase = await getServerClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${getBaseUrl()}/auth/callback`,
            },
        });

        if (error) {
            redirect(`/signup?error=${encodeURIComponent(error.message)}`);
        }

        // With "Confirm email" on, signUp() returns a user but no
        // session yet — the account only becomes active once they
        // click the link Supabase just emailed them.
        if (!data.session) {
            redirect("/signup?sent=1");
        }

        redirect("/dashboard/links");
    }

    if (sent) {
        return (
            <main id="main" className="min-h-svh flex items-center justify-center px-6">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <MailCheck className="size-6 mx-auto text-muted-foreground" />
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Check your email
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            We sent you a confirmation link. Click it to
                            activate your account.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main id="main" className="min-h-svh flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create an account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Get started shortening and tracking links.
                    </p>
                </div>

                <form action={signUp} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-xs text-destructive">
                            {error}
                        </p>
                    )}

                    <Button type="submit" className="w-full">
                        Create account
                    </Button>
                </form>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <GoogleSignInButton />

                <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
