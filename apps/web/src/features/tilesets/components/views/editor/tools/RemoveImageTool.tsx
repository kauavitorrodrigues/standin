import { XIcon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";

type Props = {
    disabled: boolean;
    onRemove?: () => void;
};

// Drops the image that was chosen, to choose another. Nothing is drawn when
// the editor cannot do that.
export const RemoveImageTool = ({ disabled, onRemove }: Props) => {
    if (!onRemove) return null;

    return (
        <ToolbarButton
            label="Remover imagem"
            description="Volta para escolher outra imagem"
            icon={XIcon}
            disabled={disabled}
            onClick={onRemove}
        />
    );
};
