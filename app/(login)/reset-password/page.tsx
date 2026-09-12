import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServerClient } from "@/lib/supabase";

export default async function ResetPassword({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    // Reaching this page with a valid session means the visitor just came
    // through /auth/callback's code exchange for a recovery link — that's
    // what authorizes them to set a new password here, no separate token.
    const supabase = await getServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    async function updatePassword(formData: FormData) {
        "use server";

        const password = String(formData.get("password") ?? "");
        const confirm = String(formData.get("confirm") ?? "");

        if (password !== confirm) {
            redirect(
                `/reset-password?error=${encodeURIComponent("Passwords don't match.")}`,
            );
        }

        const supabase = await getServerClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
        }

        redirect("/dashboard/links");
    }

    if (!user) {
        return (
            <main id="main" className="min-h-svh flex items-center justify-center px-6">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Link expired
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            That reset link is invalid or has expired.
                        </p>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-foreground hover:underline"
                    >
                        Request a new one
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main id="main" className="min-h-svh flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Set a new password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a new password for your account.
                    </p>
                </div>

                <form action={updatePassword} className="space-y-4">
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                        >
                            New password
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

                    <div>
                        <label
                            htmlFor="confirm"
                            className="block text-sm font-medium mb-2"
                        >
                            Confirm password
                        </label>
                        <Input
                            id="confirm"
                            name="confirm"
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
                        Update password
                    </Button>
                </form>
            </div>
        </main>
    );
}
