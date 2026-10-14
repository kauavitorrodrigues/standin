import { TILE_CATEGORIES, TILE_SIZE, type Tileset } from "@standin/contracts";
import { PickerControl } from "@/features/editor/components/views/PickerControl";
import { OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX } from "@/features/editor/consts/object-toolbar";
import type { EditorBrush } from "@/features/editor/types/editor-brush";
import { getPaletteTileCutout } from "@/features/editor/utils/getPaletteTileCutout";
import { getPaletteTiles } from "@/features/editor/utils/getPaletteTiles";
import { getTileCutoutStyle } from "@/features/tilesets/utils/editor/getCutoutStyle";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

const BUTTON_ZOOM = 1.5;
const GRID_ZOOM = 2;

type ZoneFloorControlProps = {
    show: boolean;
    tilesets: readonly Tileset[];
    // The floor tile the area has most of, null when it has none.
    current: EditorBrush | null;
    onSelect: (tile: EditorBrush) => void;
};

type FloorTileProps = {
    tileset: Tileset;
    index: number;
    zoom: number;
};

const FloorTile = ({ tileset, index, zoom }: FloorTileProps) => (
    <span
        className="block shrink-0 rounded-sm"
        style={{
            width: TILE_SIZE * zoom,
            height: TILE_SIZE * zoom,
            ...getTileCutoutStyle(
                getPaletteTileCutout(
                    tileset,
                    index,
                    zoom,
                    resolveFileUrl(tileset.url, API_BASE_URL)
                )
            ),
        }}
    />
);

type CurrentPreviewProps = Pick<ZoneFloorControlProps, "tilesets" | "current">;

const CurrentPreview = ({ tilesets, current }: CurrentPreviewProps) => {
    const tileset = tilesets.find(({ id }) => id === current?.tilesetId);
    if (!current || !tileset) {
        return <span className="bg-muted size-5 rounded-full" />;
    }
    return (
        <FloorTile
            tileset={tileset}
            index={current.tileIndex}
            zoom={BUTTON_ZOOM}
        />
    );
};

// Repaints the whole floor of the area with one tile. The button shows the
// floor it has now and the popover lists every floor tile of the library.
export const ZoneFloorControl = ({
    show,
    tilesets,
    current,
    onSelect,
}: ZoneFloorControlProps) => {
    if (!show) return null;

    const choices = tilesets.flatMap((tileset) =>
        getPaletteTiles(tileset, TILE_CATEGORIES.FLOOR).map((tile) => ({
            tileset,
            tile,
        }))
    );
    if (choices.length === 0) return null;

    return (
        <PickerControl
            tooltipOffset={OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX}
            label="Chão"
            preview={<CurrentPreview tilesets={tilesets} current={current} />}
            contentClassName="rounded-xl p-3"
        >
            <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto p-1">
                {choices.map(({ tileset, tile }) => (
                    <button
                        key={`${tileset.id}:${tile.index}`}
                        type="button"
                        title={`Chão ${tile.index}`}
                        aria-label={`Chão ${tile.index}`}
                        aria-pressed={
                            current?.tilesetId === tileset.id &&
                            current.tileIndex === tile.index
                        }
                        onClick={() =>
                            onSelect({
                                tilesetId: tileset.id,
                                tileIndex: tile.index,
                            })
                        }
                        className="ring-border hover:ring-foreground/40 aria-pressed:ring-primary rounded-sm ring-1 aria-pressed:ring-2"
                    >
                        <FloorTile
                            tileset={tileset}
                            index={tile.index}
                            zoom={GRID_ZOOM}
                        />
                    </button>
                ))}
            </div>
        </PickerControl>
    );
};
