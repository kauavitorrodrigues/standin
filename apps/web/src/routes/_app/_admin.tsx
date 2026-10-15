import { createFileRoute, redirect } from "@tanstack/react-router";
import { USER_ROLES } from "@standin/contracts";
import { AdminSidebar } from "@/features/admin/components/layout/AdminSidebar";
import { SectionShell } from "@/features/library/components/layout/SectionShell";

export const Route = createFileRoute("/_app/_admin")({
    beforeLoad: ({ context }) => {
        if (context.user.role !== USER_ROLES.ADMIN) {
            throw redirect({ to: "/home" });
        }
    },
    component: AdminLayout,
});

function AdminLayout() {
    return <SectionShell title="Administração" sidebar={<AdminSidebar />} />;
}
