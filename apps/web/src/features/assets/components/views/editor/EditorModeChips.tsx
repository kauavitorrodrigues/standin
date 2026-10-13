import { EDITOR_MODES, type EditorMode } from "../../../consts/editorModes";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { hasCrop } from "../../../utils/spriteGeometry";
import { CropChip } from "./CropChip";
import { FootprintSwatch } from "./FootprintSwatch";
import { ModeChipSize } from "./ModeChipSize";

type Props = {
    crop: Crop;
    footprint: Footprint;
    solid: boolean;
    mode: EditorMode;
    // Only the footprint is marked, so there is no crop to switch to.
    footprintOnly?: boolean;
    onModeChange: (mode: EditorMode) => void;
};

// The two rectangles of the editor. Each chip is the legend of its color and
// also the switch between marking the crop and marking the footprint.
export const EditorModeChips = ({
    crop,
    footprint,
    solid,
    mode,
    footprintOnly = false,
    onModeChange,
}: Props) => (
    <div className="flex gap-2 text-xs">
        <CropChip
            footprintOnly={footprintOnly}
            crop={crop}
            mode={mode}
            onModeChange={onModeChange}
        />
        <button
            type="button"
            data-active={mode === EDITOR_MODES.FOOTPRINT}
            disabled={!hasCrop(crop)}
            onClick={() => onModeChange(EDITOR_MODES.FOOTPRINT)}
            className="flex items-center gap-2 rounded-md border border-red-500/30 px-2.5 py-1.5 opacity-60 transition disabled:cursor-not-allowed disabled:opacity-35 data-[active=true]:border-red-500 data-[active=true]:bg-red-500/15 data-[active=true]:opacity-100"
        >
            <FootprintSwatch solid={solid} />
            <span className="font-medium">Pegada</span>
            <ModeChipSize
                show={hasCrop(crop)}
                width={footprint.w}
                height={footprint.h}
            />
        </button>
    </div>
);
