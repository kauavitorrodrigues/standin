import { createFileRoute } from "@tanstack/react-router";
import { AvatarNewPage } from "@/features/avatar/components/pages/admin/AvatarNewPage";
import { avatarNewSearchSchema } from "@/features/avatar/schemas/avatarNewSearch";

export const Route = createFileRoute("/_app/_admin/admin/avatar/new")({
    validateSearch: avatarNewSearchSchema,
    component: RouteComponent,
});

function RouteComponent() {
    const { kind, partId } = Route.useSearch();
    return <AvatarNewPage kind={kind} partId={partId} />;
}
