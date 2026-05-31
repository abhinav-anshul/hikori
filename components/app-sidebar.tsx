"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronsUpDown, Globe, Link2, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
    { title: "Links", href: "/dashboard/links", icon: Link2 },
    { title: "Domains", href: "/dashboard/domains", icon: Globe },
    { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function AppSidebar({
    userEmail,
    signOutAction,
}: {
    userEmail?: string | null;
    signOutAction: () => void | Promise<void>;
}) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="px-2 py-2 text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                    Hikori
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {/* <div>
                        sdf
                    </div> */}

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`);
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.title}
                                            render={<Link href={item.href} />}
                                            className="data-active:text-sidebar-accent-foreground data-active:bg-primary/15 data-active:hover:bg-primary/20 not-data-active:hover:bg-accent not-data-active:hover:text-sidebar-foreground"
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {userEmail ? (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <SidebarMenuButton
                                            size="lg"
                                            tooltip={userEmail}
                                            className="cursor-pointer data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                                        />
                                    }
                                >
                                    <Avatar className="size-8 rounded-md">
                                        <AvatarFallback className="rounded-md text-sm font-medium bg-primary text-primary-foreground uppercase">
                                            {userEmail.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Abhinav</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {userEmail}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="right"
                                    align="end"
                                    sideOffset={8}
                                    className="min-w-56"
                                >
                                    <form action={signOutAction}>
                                        <DropdownMenuItem
                                            render={
                                                <button
                                                    type="submit"
                                                    className="w-full"
                                                />
                                            }
                                        >
                                            <LogOut />
                                            <span>Sign out</span>
                                        </DropdownMenuItem>
                                    </form>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                ) : null}
            </SidebarFooter>
        </Sidebar>
    );
}
