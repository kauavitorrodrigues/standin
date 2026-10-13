import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { USER_ROLES } from "@standin/contracts";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/layout/AdminSidebar";
import { AdminTopBar } from "@/features/admin/components/layout/AdminTopBar";

export const Route = createFileRoute("/_app/_admin")({
    beforeLoad: ({ context }) => {
        if (context.user.role !== USER_ROLES.ADMIN) {
            throw redirect({ to: "/home" });
        }
    },
    component: AdminLayout,
});

function AdminLayout() {
    return (
        <SidebarProvider
            // Never expands on desktop: the rail is fixed at 64px and has
            // no toggle. Mobile opens its sheet through openMobile instead.
            open={false}
            className="h-full min-h-0 [--sidebar:var(--background)]"
            style={{ "--sidebar-width-icon": "4rem" } as CSSProperties}
        >
            <AdminSidebar />
            <SidebarInset className="min-h-0 overflow-hidden">
                <AdminTopBar />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}
