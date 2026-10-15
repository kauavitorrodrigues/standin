import { createFileRoute } from "@tanstack/react-router";
import { NewAreaPage } from "@/features/areas/components/pages/NewAreaPage";

// The size of the area is not asked before: it is the frame dragged on the
// canvas of the composer.
export const Route = createFileRoute("/_app/_admin/admin/areas/new")({
    component: NewAreaPage,
});
