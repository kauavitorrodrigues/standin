import { createFileRoute } from "@tanstack/react-router";
import { ServiceTokensPage } from "@/features/service-tokens/components/pages/ServiceTokensPage";

export const Route = createFileRoute("/_app/_admin/admin/service-tokens/")({
    component: ServiceTokensPage,
});
