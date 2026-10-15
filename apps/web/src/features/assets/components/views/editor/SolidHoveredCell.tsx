import { FOOTPRINT_COLOR } from "../../../consts/editorColors";
import { SOLID_HOVER_TINT_PERCENT } from "../../../consts/editorOverlayStyle";
import type { Zoom } from "../../../consts/editorZoom";
import { SOLID_CELL_PX } from "../../../consts/solidMask";
import type { SolidCell } from "../../../types/footprintMask";
import type { Crop } from "../../../types/spriteGeometry";

type Props = {
    zoom: Zoom;
    // The footprint on the image, in px.
    rect: Crop;
    cell: SolidCell | null;
};

// The cell under the pointer, which a press would paint or erase.
export const SolidHoveredCell = ({ zoom, rect, cell }: Props) => {
    if (!cell) return null;

    return (
        <div
            className="pointer-events-none absolute border border-white"
            style={{
                left: (rect.x + cell.col * SOLID_CELL_PX) * zoom,
                top: (rect.y + cell.row * SOLID_CELL_PX) * zoom,
                width: SOLID_CELL_PX * zoom,
                height: SOLID_CELL_PX * zoom,
                backgroundColor: `color-mix(in srgb, ${FOOTPRINT_COLOR} ${SOLID_HOVER_TINT_PERCENT}%, transparent)`,
            }}
        />
    );
};
