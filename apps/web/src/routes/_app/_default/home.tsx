import { createFileRoute, redirect } from "@tanstack/react-router";
import { OrganizationsPage } from "@/features/organizations/components/pages/OrganizationsPage";
import { takeReturnPath } from "@/features/auth/lib/returnTo";

export const Route = createFileRoute("/_app/_default/home")({
    // A signup or a provider login lands here: the page the person was going
    // to before it goes first.
    beforeLoad: () => {
        const returnPath = takeReturnPath();
        if (returnPath) throw redirect({ href: returnPath });
    },
    component: OrganizationsPage,
});
