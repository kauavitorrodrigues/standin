import { ArrowUpToLineIcon, ShieldIcon } from "lucide-react";
import { TILE_SIZE, type Tileset } from "@standin/contracts";
import { getTileCutoutStyle } from "@/features/tilesets/utils/editor/getCutoutStyle";
import { TILE_PALETTE_ZOOM } from "@/features/maps/__shared__/consts/tilePalette";
import type { PaletteTile } from "@/features/maps/__shared__/types/palette-tile";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import { getPaletteTileCutout } from "@/features/maps/__shared__/utils/getPaletteTileCutout";

type TileButtonProps = {
    tileset: Tileset;
    tile: PaletteTile;
    categoryLabel: string;
    selected: boolean;
    onPick: (tileIndex: number) => void;
};

type TileMarkProps = {
    show: boolean;
    label: string;
    children: React.ReactNode;
};

const TileMark = ({ show, label, children }: TileMarkProps) => {
    if (!show) return null;

    return (
        <span
            title={label}
            className="flex size-4 items-center justify-center rounded-sm bg-background/80 text-foreground"
        >
            {children}
        </span>
    );
};

// One tile of the tileset, cut from the image and drawn without smoothing.
// The marks tell if it is solid and if it has a top.
export const TileButton = ({
    tileset,
    tile,
    categoryLabel,
    selected,
    onPick,
}: TileButtonProps) => {
    const size = TILE_SIZE * TILE_PALETTE_ZOOM;

    return (
        <button
            type="button"
            title={`${categoryLabel} ${tile.index}`}
            aria-label={`Tile ${tile.index}, ${categoryLabel}`}
            aria-pressed={selected}
            onClick={() => onPick(tile.index)}
            className="relative shrink-0 rounded-sm bg-muted/40 ring-1 ring-border hover:ring-foreground/40 aria-pressed:ring-2 aria-pressed:ring-primary"
            style={{
                width: size,
                height: size,
                ...getTileCutoutStyle(
                    getPaletteTileCutout(
                        tileset,
                        tile.index,
                        TILE_PALETTE_ZOOM,
                        resolveFileUrl(tileset.url, API_BASE_URL)
                    )
                ),
            }}
        >
            <span className="absolute right-0.5 bottom-0.5 flex gap-0.5">
                <TileMark show={tile.solid} label="Sólido">
                    <ShieldIcon className="size-3" />
                </TileMark>
                <TileMark show={tile.hasTop} label="Com topo">
                    <ArrowUpToLineIcon className="size-3" />
                </TileMark>
            </span>
        </button>
    );
};
