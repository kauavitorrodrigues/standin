import { OrganizationSwitcher } from "@/features/organizations/components/instances/OrganizationSwitcher";
import { UserMenu } from "@/features/users/components/UserMenu";

export function Header() {
    return (
        <header className="h-14 w-full border-b border-border flex items-center justify-between px-6">
            <span className="text-lg font-semibold">STANDIN</span>
            <div className="flex items-center gap-4">
                <OrganizationSwitcher />
                <UserMenu />
            </div>
        </header>
    );
}
