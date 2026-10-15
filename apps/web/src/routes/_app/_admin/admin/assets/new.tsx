import { createFileRoute } from "@tanstack/react-router";
import { CreateAssetPage } from "@/features/assets/components/pages/CreateAssetPage";

export const Route = createFileRoute("/_app/_admin/admin/assets/new")({
    component: CreateAssetPage,
});
