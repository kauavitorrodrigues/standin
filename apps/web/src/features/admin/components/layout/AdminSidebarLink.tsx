import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import type { AdminSection } from "../../consts/adminSections";
import { ADMIN_SECTIONS } from "../../consts/adminSections";

type Props = {
    section: AdminSection;
    icon: LucideIcon;
    label: string;
    active: boolean;
};

export const AdminSidebarLink = ({
    section,
    icon: Icon,
    label,
    active,
}: Props) => {
    const { setOpenMobile } = useSidebar();
    const target = ADMIN_SECTIONS.find((item) => item.value === section);

    if (!target) return null;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={active}
                className="rounded-xl text-muted-foreground hover:bg-foreground/10 hover:text-foreground data-active:bg-foreground/10 data-active:text-foreground group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center [&_svg]:size-[22px]"
                tooltip={label}
                render={<Link to={target.to} />}
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
