import { XIcon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";

type ClearSelectionButtonProps = {
    // There is an object being placed or something selected to clear.
    canClear: boolean;
    onClear: () => void;
};

// Leaves the placing mode and takes the selection off, without a change of
// tool. It waits for something to clear.
export const ClearSelectionButton = ({
    canClear,
    onClear,
}: ClearSelectionButtonProps) => (
    <ToolbarButton
        label="Limpar seleção"
        icon={XIcon}
        description="Sai do modo de colocar e tira a seleção"
        shortcut="Esc"
        disabled={!canClear}
        onClick={onClear}
    />
);
