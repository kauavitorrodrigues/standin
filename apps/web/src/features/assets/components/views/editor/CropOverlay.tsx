import { EDITOR_MODES, type EditorMode } from "../../../consts/editorModes";
import type { Zoom } from "../../../consts/editorZoom";
import type {
    FootprintMaskValue,
    SolidCell,
    SolidMaskValue,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { getLayerOpacity } from "../../../utils/getLayerOpacity";
import { hasCrop, hasFootprint } from "../../../utils/spriteGeometry";
import { CollisionLayer } from "./CollisionLayer";
import { CropLayer } from "./CropLayer";
import { FootprintLayer } from "./FootprintLayer";

type Props = {
    zoom: Zoom;
    crop: Crop;
    frame: Crop;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    // The footprint is painted by cells, as it is for a still piece.
    byCells?: boolean;
    // The layer being edited is drawn in full, the others dimmed or hidden.
    mode?: EditorMode;
    // The asset has a collision to draw.
    collisionAvailable?: boolean;
    solidMask?: SolidMaskValue;
    hoveredCell?: SolidCell | null;
};

// The cell under the pointer is only drawn on the layer being edited.
const getActiveCell = (
    mode: EditorMode,
    layer: EditorMode,
    cell: SolidCell | null
) => {
    if (mode !== layer) return null;
    return cell;
};

// The footprint is not drawn until it is marked.
const getFootprintOpacity = (marked: boolean, mode: EditorMode) => {
    if (!marked) return null;
    return getLayerOpacity(EDITOR_MODES.FOOTPRINT, mode);
};

// The layers the editor marks over the image, stacked: the crop (with the
// line between the frames of a strip), the footprint on each frame and the
// collision. Nothing until the crop is marked.
export const CropOverlay = ({
    zoom,
    crop,
    frame,
    footprint,
    mask,
    solid,
    byCells = false,
    mode = EDITOR_MODES.FOOTPRINT,
    collisionAvailable = false,
    solidMask = null,
    hoveredCell = null,
}: Props) => {
    if (!hasCrop(crop)) return null;

    const isFootprintMarked = hasFootprint(footprint);

    // How many frames the crop holds, 1 when it is not a strip.
    const frameCount = Math.max(Math.round(crop.w / frame.w), 1);

    return (
        <>
            <CropLayer
                opacity={getLayerOpacity(EDITOR_MODES.CROP, mode)}
                zoom={zoom}
                crop={crop}
                frame={frame}
                frameCount={frameCount}
            />
            <FootprintLayer
                opacity={getFootprintOpacity(isFootprintMarked, mode)}
                active={mode === EDITOR_MODES.FOOTPRINT}
                zoom={zoom}
                frame={frame}
                frameCount={frameCount}
                footprint={footprint}
                mask={mask}
                solid={solid}
                byCells={byCells}
                hoveredCell={getActiveCell(
                    mode,
                    EDITOR_MODES.FOOTPRINT,
                    hoveredCell
                )}
            />
            <CollisionLayer
                opacity={getLayerOpacity(EDITOR_MODES.COLLISION, mode)}
                active={mode === EDITOR_MODES.COLLISION}
                available={collisionAvailable && isFootprintMarked}
                zoom={zoom}
                frame={frame}
                footprint={footprint}
                mask={mask}
                solidMask={solidMask}
                hoveredCell={getActiveCell(
                    mode,
                    EDITOR_MODES.COLLISION,
                    hoveredCell
                )}
            />
        </>
    );
};
