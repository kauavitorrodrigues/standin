import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TILE_EDITOR_KEYS } from "../../../../consts/editorKeys";

type Props = {
    solid: boolean;
    disabled: boolean;
    onSolidChange: (solid: boolean) => void;
};

// Whether what is painted blocks the avatar. It is part of the brush, so the
// tiles come out solid as they are painted.
export const TileSolidToggle = ({ solid, disabled, onSolidChange }: Props) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Sólido"
                    aria-pressed={solid}
                    disabled={disabled}
                    className={cn(solid && "bg-foreground/15")}
                    onClick={() => onSolidChange(!solid)}
                />
            }
        >
            <LockIcon />
        </TooltipTrigger>
        <TooltipContent
            side="left"
            shortcut={TILE_EDITOR_KEYS.TOGGLE_SOLID[0].toUpperCase()}
        >
            Sólido: o avatar não passa pelo que for pintado
        </TooltipContent>
    </Tooltip>
);
