import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    disabled: boolean;
    onRemove: () => void;
};

// Drops the image that was chosen, to choose another.
export const RemoveImageButton = ({ disabled, onRemove }: Props) => (
    <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Remover imagem"
        title="Remover imagem"
        disabled={disabled}
        onClick={onRemove}
    >
        <XIcon />
    </Button>
);
