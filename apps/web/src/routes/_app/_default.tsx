import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_app/_default")({
    component: DefaultLayout,
});

function DefaultLayout() {
    return (
        <div className="flex h-full min-h-0 w-full flex-col">
            <Header />
            <div className="flex min-h-0 flex-1 flex-col">
                <Outlet />
            </div>
        </div>
    );
}
