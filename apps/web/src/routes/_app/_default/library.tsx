import { createFileRoute, redirect } from "@tanstack/react-router";
import { LibraryLayout } from "@/features/library/components/layout/LibraryLayout";

// The library of the organization is the owner's. The role comes from the
// organization, so a member who types the URL goes back to the spaces.
export const Route = createFileRoute("/_app/_default/library")({
    beforeLoad: ({ context }) => {
        if (context.organization?.ownerId !== context.user.id) {
            throw redirect({ to: "/home" });
        }
    },
    component: LibraryLayout,
});
