import { Redo2Icon, Trash2Icon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type HistoryButtonsProps = {
    canUndo: boolean;
    canRedo: boolean;
    canDiscard: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onDiscard: () => void;
};

// Undo, redo and discard, on the foot of the panel. The keys are in the
// tooltip. Discard stays here and waits for a change to the draft.
export const HistoryButtons = ({
    canUndo,
    canRedo,
    canDiscard,
    onUndo,
    onRedo,
    onDiscard,
}: HistoryButtonsProps) => (
    <div className="flex items-center gap-1.5">
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Desfazer"
                        disabled={!canUndo}
                        onClick={onUndo}
                    />
                }
            >
                <Undo2Icon />
            </TooltipTrigger>
            <TooltipContent shortcut="Ctrl+Z">Desfazer</TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Refazer"
                        disabled={!canRedo}
                        onClick={onRedo}
                    />
                }
            >
                <Redo2Icon />
            </TooltipTrigger>
            <TooltipContent shortcut="Ctrl+Shift+Z">Refazer</TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Descartar alterações"
                        disabled={!canDiscard}
                        onClick={onDiscard}
                    />
                }
            >
                <Trash2Icon />
            </TooltipTrigger>
            <TooltipContent>Descartar alterações</TooltipContent>
        </Tooltip>
    </div>
);
