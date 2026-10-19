import { createFileRoute } from "@tanstack/react-router";
import { AvatarBasesPage } from "@/features/avatar/components/pages/admin/AvatarBasesPage";

export const Route = createFileRoute("/_app/_admin/admin/avatar-bases/")({
    component: AvatarBasesPage,
});
