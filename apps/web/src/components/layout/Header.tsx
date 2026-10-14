import { Link } from "@tanstack/react-router";
import { OrganizationSwitcher } from "@/features/organizations/components/instances/OrganizationSwitcher";
import { UserMenu } from "@/features/users/components/UserMenu";
import { LogoFull } from "@/components/logos";
import { AreaTabs } from "@/features/library/components/layout/AreaTabs";

export function Header() {
    return (
        <header className="h-14 w-full border-b border-border grid grid-cols-[1fr_auto_1fr] items-center px-6">
            <Link to="/home" aria-label="Início" className="w-fit">
                <LogoFull />
            </Link>
            <AreaTabs />
            <div className="col-start-3 flex items-center justify-end gap-4">
                <OrganizationSwitcher />
                <UserMenu />
            </div>
        </header>
    );
}
