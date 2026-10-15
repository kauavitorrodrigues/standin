import type { ReactNode } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
} from "@/components/ui/sidebar";

type Props = {
    header?: ReactNode;
    footer?: ReactNode;
    // "contained" when the sidebar sits below a page header instead of
    // taking the whole viewport.
    position?: "fixed" | "contained";
    children: ReactNode;
};

// The icon rail shared by the admin and the library of an organization:
// always collapsed on desktop (the provider keeps it so) and a sheet on
// mobile. The links go in as children, and the sections live in the URL.
export const SectionSidebar = ({
    header,
    footer,
    position = "fixed",
    children,
}: Props) => (
    <Sidebar collapsible="icon" position={position}>
        <SidebarHeader className="p-2.5 group-data-[collapsible=icon]:items-center empty:hidden">
            {header}
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup className="p-2.5 group-data-[collapsible=icon]:items-center">
                <SidebarGroupContent>
                    <SidebarMenu className="gap-2">{children}</SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2.5 pb-3 group-data-[collapsible=icon]:items-center empty:hidden">
            {footer}
        </SidebarFooter>
    </Sidebar>
);
