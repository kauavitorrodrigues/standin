import { createFileRoute } from "@tanstack/react-router";
import { GlobalSettingsPage } from "@/features/global-settings/components/pages/GlobalSettingsPage";

export const Route = createFileRoute("/_app/_admin/admin/global-settings/")({
    component: GlobalSettingsPage,
});
