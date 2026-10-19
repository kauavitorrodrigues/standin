import { createFileRoute, notFound } from "@tanstack/react-router";
import { AvatarLabPage } from "@/features/avatar/components/pages/lab/AvatarLabPage";

// Only in development: a production build answers as if the page did not exist.
export const Route = createFileRoute("/_app/dev/avatar-lab")({
    beforeLoad: () => {
        if (!import.meta.env.DEV) throw notFound();
    },
    component: AvatarLabPage,
});
