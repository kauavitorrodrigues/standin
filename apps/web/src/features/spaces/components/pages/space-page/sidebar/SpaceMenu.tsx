import type { ReactNode } from "react";
import { LogOutIcon, UserPlusIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { InviteMessages } from "@/features/spaces/components/forms/Messages";
import { LogoGlyph } from "@/components/logos";

// The logo opens the space actions instead of navigating. New actions are
// added here as the space gains them. Items that need the space (such as
// Edit) come in as children, because the unavailable page has no space.
export const SpaceMenu = ({ children }: { children?: ReactNode }) => {
    const copyInviteLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.add({ title: InviteMessages.copied, type: "success" });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        className="relative size-12 rounded-xl hover:bg-foreground/10"
                        aria-label="Ações do espaço"
                    />
                }
            >
                <LogoGlyph className="size-9" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={12}
                className="w-60"
            >
                <DropdownMenuItem onClick={copyInviteLink}>
                    <UserPlusIcon />
                    Convidar pessoas
                </DropdownMenuItem>
                {children}
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem render={<Link to="/home" />}>
                    <LogOutIcon />
                    Sair do espaço
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
