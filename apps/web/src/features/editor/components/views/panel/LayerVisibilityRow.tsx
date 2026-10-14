import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLayerLabel } from "@/features/editor/utils/getLayerLabel";

type LayerVisibilityRowProps = {
    layer: string;
    visible: boolean;
    onToggleVisible: (layer: string) => void;
};

// One layer: the whole row shows or hides it in the editor.
export const LayerVisibilityRow = ({
    layer,
    visible,
    onToggleVisible,
}: LayerVisibilityRowProps) => {
    const label = getLayerLabel(layer);
    const Icon = visible ? EyeIcon : EyeOffIcon;

    return (
        <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
            aria-pressed={!visible}
            className="w-full justify-between capitalize aria-pressed:text-muted-foreground"
            onClick={() => onToggleVisible(layer)}
        >
            {label}
            <Icon />
        </Button>
    );
};
