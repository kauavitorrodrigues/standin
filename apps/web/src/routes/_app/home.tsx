import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";

export const Route = createFileRoute("/_app/home")({
    component: HomePage,
});
