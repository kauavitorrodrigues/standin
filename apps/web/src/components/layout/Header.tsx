import { Link } from "@tanstack/react-router";
import { OrganizationSwitcher } from "@/features/organizations/components/instances/OrganizationSwitcher";
import { UserMenu } from "@/features/users/components/UserMenu";
import { LogoFull } from "@/components/logos";
import { HeaderTabs } from "./HeaderTabs";

export function Header() {
    return (
        <header className="h-14 w-full border-b border-border grid grid-cols-[1fr_auto_1fr] items-center px-6">
            <Link to="/home" aria-label="Início" className="justify-self-start">
                <LogoFull />
            </Link>
            <HeaderTabs />
            <div className="flex items-center justify-end gap-4">
                <OrganizationSwitcher />
                <UserMenu />
            </div>
        </header>
    );
}
