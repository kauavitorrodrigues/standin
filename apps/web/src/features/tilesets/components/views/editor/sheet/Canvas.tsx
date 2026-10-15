import type { HTMLAttributes, RefObject } from "react";
import { TILE_SIZE, type TileMeta } from "@standin/contracts";
import {
    CHECKER_DARK,
    CHECKER_LIGHT,
} from "@/features/assets/consts/editorColors";
import type { TileZoom } from "../../../../consts/sheetZoom";
import type { TileFilter, TileSheetGrid } from "../../../../types/sheet";
import { getGridLineStyle } from "../../../../utils/grid/getGridLineStyle";
import { isCategoryFilter } from "../../../../utils/editor/filter";
import { CategoryVeil } from "./Veil";
import { TileOverlays } from "./Overlays";

type Props = {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    zoom: TileZoom;
    selected: number[];
    hovered: number | null;
    filter: TileFilter;
    // The tile that is the top of the selected wall, outlined as a reference.
    topTile: number | null;
    // What the tool in use would touch, outlined before the click.
    preview: number[];
    // A drag over the sheet pans it, so the pointer is a hand.
    panMode: boolean;
    isLocked: (index: number) => boolean;
    scrollRef: RefObject<HTMLDivElement | null>;
    pointerHandlers: Pick<
        HTMLAttributes<HTMLDivElement>,
        "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerLeave"
    >;
};

// The sheet with the grid of its cells over it. A tile with a category is
// tinted with the color of its category and carries a mark for what else it
// says (solid, default of the blank map). It only draws, a drag over it means
// what the editor says it means.
//
// The area has as much room around the sheet as the screen is big, so the
// sheet can be dragged anywhere in it, even when it fits whole, like the canvas
// of Figma. The scroll bars are hidden, the drag and the wheel do their job.
//
// The grid is one gradient, and the tiles that say something are drawn over it.
export const TileSheetCanvas = ({
    url,
    grid,
    meta,
    zoom,
    selected,
    hovered,
    filter,
    topTile,
    preview,
    panMode,
    isLocked,
    scrollRef,
    pointerHandlers,
}: Props) => {
    const px = (value: number) => value * zoom;
    return (
        <div
            ref={scrollRef}
            className="h-full min-h-0 overflow-auto bg-[color-mix(in_oklch,var(--background),black_6%)] cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:bg-[color-mix(in_oklch,var(--background),black_30%)]"
        >
            <div className="w-max p-[100vh_100vw]">
                <div
                    data-tile-sheet
                    className="relative shrink-0 touch-none select-none"
                    style={{
                        width: px(grid.widthPx),
                        height: px(grid.heightPx),
                        cursor: panMode ? "grab" : "crosshair",
                        backgroundColor: CHECKER_DARK,
                        backgroundImage: `conic-gradient(${CHECKER_LIGHT} 25%, transparent 0 50%, ${CHECKER_LIGHT} 0 75%, transparent 0)`,
                        backgroundSize: `${px(TILE_SIZE / 2)}px ${px(TILE_SIZE / 2)}px`,
                    }}
                    {...pointerHandlers}
                >
                    <img
                        src={url}
                        alt="Folha do tileset"
                        draggable={false}
                        className="absolute inset-0 max-w-none"
                        style={{
                            width: px(grid.widthPx),
                            height: px(grid.heightPx),
                            imageRendering: "pixelated",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={getGridLineStyle(grid, zoom)}
                    />
                    <CategoryVeil show={isCategoryFilter(filter)} />
                    <TileOverlays
                        url={url}
                        grid={grid}
                        meta={meta}
                        zoom={zoom}
                        selected={selected}
                        hovered={hovered}
                        filter={filter}
                        topTile={topTile}
                        preview={preview}
                        isLocked={isLocked}
                    />
                </div>
            </div>
        </div>
    );
};
