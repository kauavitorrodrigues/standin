import { Link } from "@tanstack/react-router";
import { OrganizationSwitcher } from "@/features/organizations/components/instances/OrganizationSwitcher";
import { UserMenu } from "@/features/users/components/UserMenu";
import { LogoFull } from "@/components/logos";

export function Header() {
    return (
        <header className="h-14 w-full border-b border-border flex items-center justify-between px-6">
            <Link to="/home" aria-label="Início">
                <LogoFull />
            </Link>
            <div className="flex items-center justify-end gap-4">
                <OrganizationSwitcher />
                <UserMenu />
            </div>
        </header>
    );
}
