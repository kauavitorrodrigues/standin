import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { organizationsQueryOptions } from "@/features/organizations/queries/organizations";
import { getActiveOrganizationId } from "@/features/organizations/lib/activeOrganization";
import { OrganizationProvider } from "@/features/organizations/contexts/OrganizationContext";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { RealtimeSocketProvider } from "@/features/realtime/contexts/RealtimeSocketContext";
import { RealtimeProvider } from "@/features/realtime/components/RealtimeProvider";
import type { Organization } from "@standin/contracts";
import { rememberReturnPath } from "@/features/auth/lib/returnTo";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ context, location }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        if (!user) {
            // The page the person was going to (an invite, a space) waits for
            // the login, which sends them back to it.
            rememberReturnPath(location.href);
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
    const { user: routeUser, organization } = Route.useRouteContext();
    // The route loads the signed in person once and never again (`staleTime:
    // "static"`), so its copy goes stale when the person renames themselves. The
    // app reads the person from the query instead, which saving the profile and
    // `space:name-changed` write to, and starts from what the route loaded.
    const { data: user = routeUser } = useQuery({
        ...getMeQueryOptions(),
        initialData: routeUser,
        staleTime: Infinity,
    });

    return (
        <AuthProvider user={user}>
            <OrganizationProvider organization={organization}>
                <RealtimeSocketProvider>
                    {/* Needs OrganizationProvider above it: useChatRealtimeEvents
                        reads the active organization to scope its query
                        invalidation. */}
                    <RealtimeProvider>
                        <div className="flex h-dvh w-full flex-col">
                            <Outlet />
                        </div>
                    </RealtimeProvider>
                </RealtimeSocketProvider>
            </OrganizationProvider>
        </AuthProvider>
    );
}
