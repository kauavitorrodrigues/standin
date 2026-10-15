import { BoxIcon, Grid2x2Icon, MapIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { LogoGlyph } from "@/components/logos";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/features/users/components/UserMenu";
import { ADMIN_SECTION_VALUES } from "../../consts/adminSections";
import { resolveAdminSection } from "../../utils/resolveAdminSection";
import { AdminSidebarLink } from "./AdminSidebarLink";

// Always an icon rail on desktop (the provider keeps it collapsed) and a
// sheet on mobile.
// The section lives in the URL: each one is a page, so a reload or a shared
// link lands on the same one.
export const AdminSidebar = () => {
    const pathname = useLocation({ select: (location) => location.pathname });
    const section = resolveAdminSection(pathname);
    const { state, isMobile, setOpenMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-2.5 group-data-[collapsible=icon]:items-center">
                <SidebarMenu className="gap-2">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="rounded-xl hover:bg-foreground/10 group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:justify-center [&_svg]:size-9"
                            tooltip="Início"
                            render={<Link to="/admin/assets" />}
                            onClick={() => setOpenMobile(false)}
                        >
                            <LogoGlyph className="shrink-0" />
                            <span className="font-semibold group-data-[collapsible=icon]:hidden">
                                Administração
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="p-2.5 group-data-[collapsible=icon]:items-center">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            <AdminSidebarLink
                                section={ADMIN_SECTION_VALUES.ASSETS}
                                icon={BoxIcon}
                                label="Biblioteca de recursos"
                                active={section === ADMIN_SECTION_VALUES.ASSETS}
                            />
                            <AdminSidebarLink
                                section={ADMIN_SECTION_VALUES.TILESETS}
                                icon={Grid2x2Icon}
                                label="Tilesets"
                                active={
                                    section === ADMIN_SECTION_VALUES.TILESETS
                                }
                            />
                            <AdminSidebarLink
                                section={ADMIN_SECTION_VALUES.MAPS}
                                icon={MapIcon}
                                label="Mapas"
                                active={section === ADMIN_SECTION_VALUES.MAPS}
                            />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-2.5 pb-3 group-data-[collapsible=icon]:items-center">
                <UserMenu
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    compact={state === "collapsed" && !isMobile}
                />
            </SidebarFooter>
        </Sidebar>
    );
};
