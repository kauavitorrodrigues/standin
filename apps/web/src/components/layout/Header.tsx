import { OrganizationSwitcher } from "@/features/organizations/components/instances/OrganizationSwitcher";
import { UserMenu } from "@/features/users/components/UserMenu";
import { Logo } from "./Logo";

export function Header() {
    return (
        <header className="h-14 w-full border-b border-border flex items-center justify-between px-6">
            <Logo />
            <div className="flex items-center gap-4">
                <OrganizationSwitcher />
                <UserMenu />
            </div>
        </header>
    );
}
