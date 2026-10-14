import { createFileRoute } from "@tanstack/react-router";
import { NewAreaPage } from "@/features/areas/components/pages/NewAreaPage";
import { parseNewAreaSearch } from "@/features/areas/utils/parseNewAreaSearch";

export const Route = createFileRoute("/_app/_admin/admin/areas/new")({
    validateSearch: parseNewAreaSearch,
    component: NewAreaRoute,
});

function NewAreaRoute() {
    const { width, height } = Route.useSearch();
    return <NewAreaPage width={width} height={height} />;
}
