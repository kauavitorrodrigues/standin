import { Link } from "@tanstack/react-router";
import { MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/features/organizations/components/instances/OrganizationSwitcher";
import { UserMenu } from "@/features/users/components/UserMenu";
import { Logo } from "./Logo";

export function Header() {
    return (
        <header className="h-14 w-full border-b border-border flex items-center justify-between px-6">
            <Logo />
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link to="/maps" />}
                >
                    <MapIcon />
                    <span className="sr-only">Mapas</span>
                </Button>
                <OrganizationSwitcher />
                <UserMenu />
            </div>
        </header>
    );
}
