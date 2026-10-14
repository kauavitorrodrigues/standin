import { TILE_SIZE, type Tileset } from "@standin/contracts";
import { VirtualGrid } from "@/components/editor/VirtualGrid";
import { TileButton } from "@/features/maps/__shared__/components/views/panel/TileButton";
import {
    TILE_PALETTE_COLUMNS,
    TILE_PALETTE_ZOOM,
} from "@/features/maps/__shared__/consts/tilePalette";
import type { EditorBrush } from "@/features/maps/__shared__/types/editor-brush";
import type { PaletteTile } from "@/features/maps/__shared__/types/palette-tile";
import { getTileCategoryMeta } from "@/features/tilesets/consts/categoryMeta";

type TileGridProps = {
    tileset: Tileset;
    tiles: PaletteTile[];
    brush: EditorBrush | null;
    onPick: (tileIndex: number) => void;
};

// The tiles in rows of four. Only the rows in view are rendered, a tileset
// can have thousands of tiles.
export const TileGrid = ({ tileset, tiles, brush, onPick }: TileGridProps) => (
    <VirtualGrid
        items={tiles}
        columns={TILE_PALETTE_COLUMNS}
        estimateRowHeight={TILE_SIZE * TILE_PALETTE_ZOOM + 6}
        getKey={(tile) => tile.index}
        renderItem={(tile) => (
            <TileButton
                tileset={tileset}
                tile={tile}
                categoryLabel={getTileCategoryMeta(tile.category).label}
                selected={
                    brush?.tilesetId === tileset.id &&
                    brush.tileIndex === tile.index
                }
                onPick={onPick}
            />
        )}
    />
);
