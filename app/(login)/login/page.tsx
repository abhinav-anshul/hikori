import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServerClient } from "@/lib/supabase";

export default async function Login({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    async function login(formData: FormData) {
        "use server";

        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const supabase = await getServerClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            redirect(`/login?error=${encodeURIComponent(error.message)}`);
        }

        redirect("/dashboard/links");
    }

    return (
        <main id="main" className="min-h-svh flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account to continue.
                    </p>
                </div>

                <form action={login} className="space-y-4">
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
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-xs text-destructive">
                            {error}
                        </p>
                    )}

                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}
