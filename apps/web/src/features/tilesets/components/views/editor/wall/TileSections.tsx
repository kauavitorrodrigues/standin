import type { TileMetaEntry } from "../../../../types/meta";
import type { TileSheetGrid } from "../../../../types/sheet";
import { resolveWallCollision } from "../../../../utils/editor/wall/paintWallCollision";
import type { TileMeta } from "@standin/contracts";
import { WallCollisionGrid } from "./CollisionGrid";
import { WallOverlapLine } from "./OverlapLine";
import { WallTileDrawing } from "./TileDrawing";

type Props = {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    index: number;
    entry: TileMetaEntry;
    disabled: boolean;
    onClearCollision: () => void;
    onClearOverlap: () => void;
};

// The two things drawn on the tile itself: the cells that block and how far
// the wall covers an avatar behind it. Only for one wall at a time, since each
// is set by looking at the tile.
export const WallTileSections = ({
    url,
    grid,
    meta,
    index,
    entry,
    disabled,
    onClearCollision,
    onClearOverlap,
}: Props) => (
    <>
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Colisão</span>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={onClearCollision}
                    className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                    Bloquear o tile todo
                </button>
            </div>
            <WallTileDrawing url={url} grid={grid} index={index}>
                <WallCollisionGrid
                    index={index}
                    cells={resolveWallCollision(meta, index)}
                    disabled={disabled}
                />
            </WallTileDrawing>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sobreposição</span>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={onClearOverlap}
                    className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                    Sem sobreposição
                </button>
            </div>
            <WallTileDrawing url={url} grid={grid} index={index}>
                <WallOverlapLine
                    rows={entry.overlap ?? 0}
                    disabled={disabled}
                />
            </WallTileDrawing>
        </div>
    </>
);
