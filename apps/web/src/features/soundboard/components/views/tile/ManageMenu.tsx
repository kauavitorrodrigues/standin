import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { SOUNDBOARD_TOOLTIP_DELAY_MS } from "../../../consts/tooltip";
import { TILE_ICON_BUTTON_CLASS } from "../../../consts/tileOverlay";
import { ClipTooltipContent } from "./TooltipContent";

type Props = {
    visible: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

const ACTIONS_LABEL = "Ações";

// The bare icon at the end of a tile that opens edit and delete, for the
// people the server says may change the clip. Open, it marks itself with
// aria-expanded, which keeps the overlay in sight.
export const ClipManageMenu = ({ visible, onEdit, onDelete }: Props) => {
    if (!visible) return null;

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger
                    delay={SOUNDBOARD_TOOLTIP_DELAY_MS}
                    render={
                        <span className="pointer-events-auto flex items-center" />
                    }
                >
                    <DropdownMenuTrigger
                        className={TILE_ICON_BUTTON_CLASS}
                        aria-label={ACTIONS_LABEL}
                    >
                        <EllipsisIcon />
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <ClipTooltipContent label={ACTIONS_LABEL} />
            </Tooltip>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <PencilIcon /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2Icon /> Apagar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
