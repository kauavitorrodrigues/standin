import { createFileRoute } from "@tanstack/react-router";
import { OrganizationsPage } from "@/features/organizations/components/pages/OrganizationsPage";

export const Route = createFileRoute("/_app/_default/home")({
    component: OrganizationsPage,
});
