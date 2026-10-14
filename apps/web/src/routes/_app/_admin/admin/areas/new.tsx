import { createFileRoute } from "@tanstack/react-router";
import { NewAreaPage } from "@/features/areas/components/pages/NewAreaPage";
import { parseNewAreaSearch } from "@/features/areas/utils/parseNewAreaSearch";

// The size of the area is no longer asked before: it is the frame dragged on
// the canvas. The search stays accepted until the dialog that sent it goes.
export const Route = createFileRoute("/_app/_admin/admin/areas/new")({
    validateSearch: parseNewAreaSearch,
    component: NewAreaPage,
});
