import { Redo2Icon, Undo2Icon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";

type Props = {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
};

// Undo and redo, with their keys in the tooltip. It goes inside a toolbar.
export const HistoryButtons = ({ canUndo, canRedo, onUndo, onRedo }: Props) => (
    <>
        <ToolbarButton
            label="Desfazer"
            icon={Undo2Icon}
            shortcut="Ctrl+Z"
            disabled={!canUndo}
            onClick={onUndo}
        />
        <ToolbarButton
            label="Refazer"
            icon={Redo2Icon}
            shortcut="Ctrl+Shift+Z"
            disabled={!canRedo}
            onClick={onRedo}
        />
    </>
);
