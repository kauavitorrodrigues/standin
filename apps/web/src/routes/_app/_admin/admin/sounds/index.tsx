import { createFileRoute } from "@tanstack/react-router";
import { AdminSoundsPage } from "@/features/soundboard/components/pages/AdminSoundsPage";

export const Route = createFileRoute("/_app/_admin/admin/sounds/")({
    component: AdminSoundsPage,
});
