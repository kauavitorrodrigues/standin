import { Redo2Icon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
};

// Undo and redo, with their keys in the tooltip.
export const TileHistoryButtons = ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}: Props) => (
    <>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Desfazer"
                        disabled={!canUndo}
                        onClick={onUndo}
                    />
                }
            >
                <Undo2Icon />
            </TooltipTrigger>
            <TooltipContent side="left" shortcut="Ctrl+Z">
                Desfazer
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Refazer"
                        disabled={!canRedo}
                        onClick={onRedo}
                    />
                }
            >
                <Redo2Icon />
            </TooltipTrigger>
            <TooltipContent side="left" shortcut="Ctrl+Shift+Z">
                Refazer
            </TooltipContent>
        </Tooltip>
    </>
);
