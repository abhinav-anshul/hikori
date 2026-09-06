import Link from "next/link";

export default function Signup() {
    return (
        <main id="main" className="min-h-svh flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-8 text-center">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create an account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Signup isn&apos;t open yet — check back soon.
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
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
