import { createFileRoute } from "@tanstack/react-router";
import { AvatarPartsPage } from "@/features/avatar/components/pages/admin/AvatarPartsPage";

export const Route = createFileRoute("/_app/_admin/admin/avatar-parts/")({
    component: AvatarPartsPage,
});
