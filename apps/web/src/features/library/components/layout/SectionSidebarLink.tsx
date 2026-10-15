import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { isSectionActive } from "../../utils/isSectionActive";

type Props = {
    to: string;
    icon: LucideIcon;
    label: string;
};

// One entry of the rail of a section sidebar, active while the URL is on its
// page or under it.
export const SectionSidebarLink = ({ to, icon: Icon, label }: Props) => {
    const { setOpenMobile } = useSidebar();
    const pathname = useLocation({ select: (location) => location.pathname });

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isSectionActive(pathname, to)}
                className="rounded-xl text-muted-foreground hover:bg-foreground/10 hover:text-foreground data-active:bg-foreground/10 data-active:text-foreground group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center [&_svg]:size-[22px]"
                tooltip={label}
                render={<Link to={to} />}
                // On mobile the sidebar is a sheet: leaving it open would
                // cover the page that was just chosen.
                onClick={() => setOpenMobile(false)}
            >
                <Icon />
                <span className="group-data-[collapsible=icon]:hidden">
                    {label}
                </span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};
