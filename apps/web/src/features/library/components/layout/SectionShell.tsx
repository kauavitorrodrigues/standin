import type { CSSProperties, ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SectionTopBar } from "./SectionTopBar";

type Props = {
    title: string;
    sidebar: ReactNode;
};

// The frame of a section area: the rail on the side, the mobile bar on top
// and the page of the section in the middle.
export const SectionShell = ({ title, sidebar }: Props) => (
    <SidebarProvider
        // Never expands on desktop: the rail is fixed at 64px and has no
        // toggle. Mobile opens its sheet through openMobile instead.
        open={false}
        className="relative h-full min-h-0 [--sidebar:var(--background)]"
        style={{ "--sidebar-width-icon": "4rem" } as CSSProperties}
    >
        {sidebar}
        <SidebarInset className="min-h-0 overflow-hidden">
            <SectionTopBar title={title} />
            <Outlet />
        </SidebarInset>
    </SidebarProvider>
);
