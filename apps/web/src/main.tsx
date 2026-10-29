import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { LoadFailurePage } from "./components/pages/LoadFailurePage";
import AppProviders from "./components/providers/AppProviders";
import { logBuildInfo } from "@/lib/buildInfo";
import { queryClient } from "@/lib/tanstack/queryClient";
import "./index.css";

logBuildInfo();

const router = createRouter({
    routeTree,
    context: { queryClient },
    // A page whose file did not download, or any error a route throws while
    // it loads, ends here instead of on a blank screen.
    defaultErrorComponent: LoadFailurePage,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AppProviders>
            <RouterProvider router={router} />
        </AppProviders>
    </StrictMode>,
);
