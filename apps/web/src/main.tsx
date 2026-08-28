import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import AppProviders from "./components/providers/AppProviders";
import { queryClient } from "@/lib/tanstack/queryClient";
import "./index.css";

const router = createRouter({
    routeTree,
    context: { queryClient },
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
