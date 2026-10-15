import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToggleVariant } from "@/features/assets/utils/getToggleVariant";
import { ZOOMS, type Zoom } from "../../../consts/editorZoom";
import { ClearMarksButton } from "./ClearMarksButton";

export type EditorViewControlsProps = {
    zoom: Zoom;
    // Whether the editor can clear its marks at all. When it cannot, the
    // button is left out.
    showClear?: boolean;
    // Whether there is anything marked to clear right now.
    canClear?: boolean;
    disabled?: boolean;
    onZoomChange: (zoom: Zoom) => void;
    onClear: () => void;
    clearLabel?: string;
    onRemoveImage: () => void;
};

// Zoom as one small segmented control, an icon to clear the marks and
// another to drop the image.
export const EditorViewControls = ({
    zoom,
    showClear = true,
    canClear = false,
    disabled = false,
    onZoomChange,
    onClear,
    clearLabel = "Limpar recorte e pegada",
    onRemoveImage,
}: EditorViewControlsProps) => (
    <div className="flex items-center gap-1">
        <div className="flex rounded-md border p-0.5">
            {ZOOMS.map((value) => (
                <Button
                    key={value}
                    type="button"
                    size="xs"
                    variant={getToggleVariant(value === zoom)}
                    onClick={() => onZoomChange(value)}
                >
                    {value}x
                </Button>
            ))}
        </div>
        <ClearMarksButton
            show={showClear}
            label={clearLabel}
            disabled={!canClear || disabled}
            onClear={onClear}
        />
        <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Remover imagem"
            title="Remover imagem"
            disabled={disabled}
            onClick={onRemoveImage}
        >
            <Trash2Icon />
        </Button>
    </div>
);
