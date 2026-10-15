import { EllipsisIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PanelMenuProps = {
    hasChanges: boolean;
    onDiscard: () => void;
};

// The menu of the panel. It only exists while there is something to discard,
// so the bar of an untouched decorator is just the title and the X.
export const PanelMenu = ({ hasChanges, onDiscard }: PanelMenuProps) => {
    if (!hasChanges) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Mais opções"
                    />
                }
            >
                <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem variant="destructive" onClick={onDiscard}>
                    <Trash2Icon />
                    Descartar alterações
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
