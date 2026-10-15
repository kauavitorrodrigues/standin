import type { ReactNode } from "react";
import { TILE_SIZE } from "@standin/contracts";
import { WALL_PANEL_ZOOM } from "../../../../consts/wall";
import type { TileSheetGrid } from "../../../../types/sheet";
import { getTileCutoutStyle } from "../../../../utils/editor/getCutoutStyle";
import { getTileOrigin } from "../../../../utils/editor/getOrigin";

type Props = {
    url: string;
    grid: TileSheetGrid;
    index: number;
    // Whatever is drawn over the tile, in its box.
    children?: ReactNode;
};

export const WALL_TILE_DRAWN_PX = TILE_SIZE * WALL_PANEL_ZOOM;

// One tile of the sheet drawn big, on a checkerboard so what is transparent
// shows. What goes over it (the collision grid, the overlap line) is a child.
export const WallTileDrawing = ({ url, grid, index, children }: Props) => {
    const origin = getTileOrigin(index, grid);

    return (
        <div
            className="border-border relative mx-auto overflow-hidden rounded-md border bg-[conic-gradient(#0000000d_25%,transparent_0_50%,#0000000d_0_75%,transparent_0)] bg-[length:16px_16px]"
            style={{ width: WALL_TILE_DRAWN_PX, height: WALL_TILE_DRAWN_PX }}
        >
            <div
                className="absolute inset-0"
                style={getTileCutoutStyle({
                    url,
                    widthPx: grid.widthPx,
                    heightPx: grid.heightPx,
                    srcX: origin.x,
                    srcY: origin.y,
                    zoom: WALL_PANEL_ZOOM,
                })}
            />
            {children}
        </div>
    );
};
