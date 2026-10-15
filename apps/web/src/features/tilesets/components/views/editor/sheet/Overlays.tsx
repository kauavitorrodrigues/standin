import { TILE_SIZE, type TileMeta } from "@standin/contracts";
import type { TileZoom } from "../../../../consts/sheetZoom";
import type { TileFilter, TileSheetGrid } from "../../../../types/sheet";
import { getTileColor } from "../../../../utils/editor/getColor";
import { getTileCutout } from "../../../../utils/editor/getCutout";
import { getTileIndicesToDraw } from "../../../../utils/editor/getIndicesToDraw";
import { getTileMarkSize } from "../../../../utils/editor/getMarkSize";
import { getTileOrigin } from "../../../../utils/editor/getOrigin";
import {
    isCategoryFilter,
    isDimmedTile,
} from "../../../../utils/editor/filter";
import { TileOverlay } from "./Overlay";

type Props = {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    zoom: TileZoom;
    selected: number[];
    hovered: number | null;
    filter: TileFilter;
    topTile: number | null;
    preview: number[];
    isLocked: (index: number) => boolean;
};

// Only the tiles that say something get an element, because a sheet can have
// thousands of cells.
export const TileOverlays = ({
    url,
    grid,
    meta,
    zoom,
    selected,
    hovered,
    filter,
    topTile,
    preview,
    isLocked,
}: Props) => {
    const side = TILE_SIZE * zoom;
    const markSize = getTileMarkSize(side);
    const selection = new Set(selected);
    const indices = getTileIndicesToDraw({
        meta,
        filter,
        selected,
        hovered,
        topTile,
        preview,
    });
    const previewing = new Set(preview);

    return indices.map((index) => {
        const entry = meta[String(index)];
        const category = entry?.category;
        const origin = getTileOrigin(index, grid);
        const isHighlighted = isCategoryFilter(filter) && category === filter;

        return (
            <TileOverlay
                key={index}
                left={origin.x * zoom}
                top={origin.y * zoom}
                side={side}
                markSize={markSize}
                color={getTileColor(category)}
                hasCategory={category !== undefined}
                solid={entry?.solid === true}
                blankDefault={entry?.blankDefault === true}
                dimmed={isDimmedTile(filter, category)}
                selected={selection.has(index)}
                isTop={index === topTile}
                previewed={previewing.has(index)}
                hovered={index === hovered}
                locked={isLocked(index)}
                cutout={getTileCutout(isHighlighted, url, grid, origin, zoom)}
            />
        );
    });
};
