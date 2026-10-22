import type { ReactNode } from "react";
import { LogOutIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoGlyph } from "@/components/logos";

// The logo opens the space actions instead of navigating. New actions are
// added here as the space gains them. Items that need the space (such as
// Edit) come in as children, because the unavailable page has no space.
export const SpaceMenu = ({ children }: { children?: ReactNode }) => {
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
