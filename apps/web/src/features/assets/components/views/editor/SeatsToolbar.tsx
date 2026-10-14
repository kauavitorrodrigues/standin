import { BrushCleaningIcon, Trash2Icon } from "lucide-react";
import { VerticalToolbar } from "@/features/editor/components/layout/VerticalToolbar";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";

type Props = {
    canClear: boolean;
    disabled: boolean;
    onClear: () => void;
    onRemoveImage: () => void;
};

// What the user acts with in the seats editor, floating on the right of the
// image like the toolbar of the footprint editor: clear the seats, or drop the
// image.
export const SeatsToolbar = ({
    canClear,
    disabled,
    onClear,
    onRemoveImage,
}: Props) => (
    <VerticalToolbar>
        <ToolbarButton
            label="Limpar assentos"
            icon={BrushCleaningIcon}
            disabled={!canClear || disabled}
            onClick={onClear}
        />
        <ToolbarButton
            label="Remover imagem"
            icon={Trash2Icon}
            disabled={disabled}
            onClick={onRemoveImage}
        />
    </VerticalToolbar>
);
