import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_MODES, type EditorMode } from "../../../consts/editorModes";
import type { Crop } from "../../../types/spriteGeometry";
import { hasCrop } from "../../../utils/spriteGeometry";
import { ModeChipSize } from "./ModeChipSize";

type Props = {
    // Only the footprint is marked, so there is no crop to switch to.
    footprintOnly: boolean;
    crop: Crop;
    mode: EditorMode;
    onModeChange: (mode: EditorMode) => void;
};

// The legend of the crop, and the switch to marking it.
export const CropChip = ({
    footprintOnly,
    crop,
    mode,
    onModeChange,
}: Props) => {
    if (footprintOnly) return null;

    return (
        <button
            type="button"
            data-active={mode === EDITOR_MODES.CROP}
            onClick={() => onModeChange(EDITOR_MODES.CROP)}
            className="flex items-center gap-2 rounded-md border border-primary/30 px-2.5 py-1.5 opacity-60 transition data-[active=true]:border-primary data-[active=true]:bg-primary/15 data-[active=true]:opacity-100"
        >
            <span className="size-3 rounded-sm border-2 border-dashed border-primary" />
            <span className="font-medium">Recorte</span>
            <ModeChipSize
                show={hasCrop(crop)}
                width={crop.w / TILE_SIZE}
                height={crop.h / TILE_SIZE}
            />
        </button>
    );
};
