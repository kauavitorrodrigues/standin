import { createFileRoute } from "@tanstack/react-router";
import { EditAreaPage } from "@/features/areas/components/pages/EditAreaPage";

export const Route = createFileRoute("/_app/_admin/admin/areas/$areaId/edit")({
    component: EditAreaRoute,
});

function EditAreaRoute() {
    const { areaId } = Route.useParams();
    return <EditAreaPage areaId={areaId} />;
}
