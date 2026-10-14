import { createFileRoute } from "@tanstack/react-router";
import { NewAreaPage } from "@/features/areas/components/pages/NewAreaPage";

export const Route = createFileRoute("/_app/_admin/admin/areas/new")({
    component: NewAreaPage,
});
