import { TILE_SIZE } from "@standin/contracts";
import type { Zoom } from "../../../consts/editorZoom";
import type {
    FootprintMaskValue,
    FootprintTile,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { isTileOccupied } from "../../../utils/footprintMask";
import { getFootprintTileStyle } from "../../../utils/getFootprintTileStyle";
import { getFootprintRect } from "../../../utils/spriteGeometry";

type Props = {
    zoom: Zoom;
    frame: Crop;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    // Draws the tiles apart even without a mask, so it shows that each one can
    // be freed with a click.
    paintable?: boolean;
    // The tile under the pointer, which a click would free or occupy.
    hoveredTile?: FootprintTile | null;
};

// The footprint tile by tile: the occupied ones look like the footprint
// without a mask, the free ones are an empty dashed outline. It is drawn for a
// mask, and for a footprint where tiles can be painted.
export const FootprintTiles = ({
    zoom,
    frame,
    footprint,
    mask,
    solid,
    paintable = false,
    hoveredTile = null,
}: Props) => {
    if (!mask && !paintable) return null;

    const origin = getFootprintRect(frame, footprint);
    const tiles = Array.from({ length: footprint.w * footprint.h }, (_, i) => ({
        col: i % footprint.w,
        row: Math.floor(i / footprint.w),
    }));

    return (
        <>
            {tiles.map((tile) => (
                <div
                    key={`${tile.row}-${tile.col}`}
                    className="pointer-events-none absolute border-2"
                    style={{
                        left: (origin.x + tile.col * TILE_SIZE) * zoom,
                        top: (origin.y + tile.row * TILE_SIZE) * zoom,
                        width: TILE_SIZE * zoom,
                        height: TILE_SIZE * zoom,
                        ...getFootprintTileStyle(
                            solid,
                            isTileOccupied(mask, tile),
                            hoveredTile?.col === tile.col &&
                                hoveredTile?.row === tile.row
                        ),
                    }}
                />
            ))}
        </>
    );
};
