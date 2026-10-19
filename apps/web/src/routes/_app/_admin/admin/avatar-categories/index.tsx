import { createFileRoute } from "@tanstack/react-router";
import { AvatarCategoriesPage } from "@/features/avatar/components/pages/admin/AvatarCategoriesPage";

export const Route = createFileRoute("/_app/_admin/admin/avatar-categories/")({
    component: AvatarCategoriesPage,
});
