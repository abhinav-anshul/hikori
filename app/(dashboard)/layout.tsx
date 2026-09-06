import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { getServerClient } from "@/lib/supabase";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [supabase, cookieStore] = await Promise.all([
        getServerClient(),
        cookies(),
    ]);
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    async function signOut() {
        "use server";
        const supabase = await getServerClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar  userEmail={user?.email} signOutAction={signOut} />
            <SidebarInset className="bg-sidebar">
                {/* <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4"> */}
                    {/* <SidebarTrigger className="-ml-1" /> */}
                    {/* <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    /> */}
                {/* </header> */}
                <div className="flex-1 p-6 m-2 bg-background border border-border rounded-xl">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
