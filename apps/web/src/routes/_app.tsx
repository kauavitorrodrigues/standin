import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { organizationsQueryOptions } from "@/features/organizations/queries/organizations";
import { getActiveOrganizationId } from "@/features/organizations/lib/activeOrganization";
import { OrganizationProvider } from "@/features/organizations/contexts/OrganizationContext";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import type { Organization } from "@standin/contracts";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        if (!user) {
            throw redirect({ to: "/" });
        }

        const organizations = await context.queryClient
            .query({ ...organizationsQueryOptions(), staleTime: "static" })
            .catch(() => []);

        const activeOrganizationId = getActiveOrganizationId();
        const organization: Organization | null =
            organizations.find((org) => org.id === activeOrganizationId) ??
            organizations[0] ??
            null;

        return { user, organization };
    },
    component: AppLayout,
});

function AppLayout() {
    const { user, organization } = Route.useRouteContext();

    return (
        <AuthProvider user={user}>
            <OrganizationProvider organization={organization}>
                <div className="flex h-dvh w-full flex-col">
                    <Outlet />
                </div>
            </OrganizationProvider>
        </AuthProvider>
    );
}
