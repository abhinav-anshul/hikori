import { MailCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBaseUrl } from "@/lib/app-url";
import { getServerClient } from "@/lib/supabase";

export default async function ForgotPassword({
    searchParams,
}: {
    searchParams: Promise<{ sent?: string }>;
}) {
    const { sent } = await searchParams;

    async function requestReset(formData: FormData) {
        "use server";

        const email = String(formData.get("email") ?? "");

        const supabase = await getServerClient();
        // Ignore the result on purpose — Supabase returns success either
        // way, so showing the same "check your email" state regardless
        // avoids leaking whether an address has an account (enumeration).
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${getBaseUrl()}/auth/callback?next=/reset-password`,
        });

        redirect("/forgot-password?sent=1");
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
                            If an account exists for that address, we sent a
                            link to reset your password.
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
                        Reset your password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and we&apos;ll send you a link to
                        reset it.
                    </p>
                </div>

                <form action={requestReset} className="space-y-4">
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

                    <Button type="submit" className="w-full">
                        Send reset link
                    </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                    Remembered your password?{" "}
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
