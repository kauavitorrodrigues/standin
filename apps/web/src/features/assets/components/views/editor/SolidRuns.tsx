import { COLLISION_COLOR } from "../../../consts/editorColors";
import { SOLID_CELL_TINT_PERCENT } from "../../../consts/editorOverlayStyle";
import type { Zoom } from "../../../consts/editorZoom";
import { SOLID_CELL_PX } from "../../../consts/solidMask";
import type { Crop } from "../../../types/spriteGeometry";
import { getSolidRuns } from "../../../utils/solidMask";

type Props = {
    zoom: Zoom;
    // The footprint on the image, in px.
    rect: Crop;
    cells: boolean[][];
    // The color of the cells, the collision one unless the footprint is shown.
    color?: string;
};

// The solid cells, one box for each run of them on a row.
export const SolidRuns = ({
    zoom,
    rect,
    cells,
    color = COLLISION_COLOR,
}: Props) => (
    <>
        {getSolidRuns(cells).map((run) => (
            <div
                key={`${run.row}-${run.col}`}
                className="pointer-events-none absolute"
                style={{
                    left: (rect.x + run.col * SOLID_CELL_PX) * zoom,
                    top: (rect.y + run.row * SOLID_CELL_PX) * zoom,
                    width: run.length * SOLID_CELL_PX * zoom,
                    height: SOLID_CELL_PX * zoom,
                    backgroundColor: `color-mix(in srgb, ${color} ${SOLID_CELL_TINT_PERCENT}%, transparent)`,
                }}
            />
        ))}
    </>
);
