import { createFileRoute } from "@tanstack/react-router";
import { AssetsPage } from "@/features/assets/components/pages/AssetsPage";

export const Route = createFileRoute("/_app/_default/library/assets/")({
    component: AssetsPage,
});
