import type { Tileset } from "@standin/contracts";
import { PanelScroll } from "@/features/editor/components/layout/PanelScroll";
import { TileGrid } from "@/features/editor/components/views/panel/TileGrid";
import { TileGridEmptyState } from "@/features/editor/components/views/panel/TileGridEmptyState";
import { TilesetEmptyState } from "@/features/editor/components/views/panel/TilesetEmptyState";
import type { EditorBrush } from "@/features/editor/types/editor-brush";
import type { PaletteTile } from "@/features/editor/types/palette-tile";

type TilesBodyProps = {
    tileset: Tileset;
    // Every tile with a category, before the chip filters them.
    allCount: number;
    tiles: PaletteTile[];
    brush: EditorBrush | null;
    onPick: (tileIndex: number) => void;
};

// What shows under the chips: the grid, or the reason it is empty.
export const TilesBody = ({
    tileset,
    allCount,
    tiles,
    brush,
    onPick,
}: TilesBodyProps) => {
    if (allCount === 0) {
        return (
            <PanelScroll>
                <TilesetEmptyState />
            </PanelScroll>
        );
    }
    if (tiles.length === 0) {
        return (
            <PanelScroll>
                <TileGridEmptyState />
            </PanelScroll>
        );
    }

    return (
        <TileGrid
            tileset={tileset}
            tiles={tiles}
            brush={brush}
            onPick={onPick}
        />
    );
};
