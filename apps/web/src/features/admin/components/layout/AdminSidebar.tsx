import {
    BoxIcon,
    Grid2x2Icon,
    KeyRoundIcon,
    LayoutGridIcon,
    MapIcon,
    ShirtIcon,
    TagsIcon,
    UserIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LogoGlyph } from "@/components/logos";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { SectionSidebar } from "@/features/library/components/layout/SectionSidebar";
import { SectionSidebarLink } from "@/features/library/components/layout/SectionSidebarLink";
import { UserMenu } from "@/features/users/components/UserMenu";

export const AdminSidebar = () => {
    const { state, isMobile, setOpenMobile } = useSidebar();

    return (
        <SectionSidebar
            header={
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
            }
            footer={
                <UserMenu
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    compact={state === "collapsed" && !isMobile}
                />
            }
        >
            <SectionSidebarLink
                to="/admin/assets"
                icon={BoxIcon}
                label="Biblioteca de recursos"
            />
            <SectionSidebarLink
                to="/admin/tilesets"
                icon={Grid2x2Icon}
                label="Tilesets"
            />
            <SectionSidebarLink
                to="/admin/areas"
                icon={LayoutGridIcon}
                label="Áreas"
            />
            <SectionSidebarLink to="/admin/maps" icon={MapIcon} label="Mapas" />
            <SectionSidebarLink
                to="/admin/avatar-parts"
                icon={ShirtIcon}
                label="Peças de avatar"
            />
            <SectionSidebarLink
                to="/admin/avatar-categories"
                icon={TagsIcon}
                label="Categorias de avatar"
            />
            <SectionSidebarLink
                to="/admin/avatar-bases"
                icon={UserIcon}
                label="Avatares base"
            />
            <SectionSidebarLink
                to="/admin/service-tokens"
                icon={KeyRoundIcon}
                label="Tokens de serviço"
            />
        </SectionSidebar>
    );
};
