import { Link } from "@tanstack/react-router";
import type { LibraryTilesetSummary } from "@standin/contracts";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import { TilesetActions } from "../../instances/TilesetActions";
import { TilesetProgressRing } from "./ProgressRing";
import { TilesetShape } from "./Shape";

type Props = { tileset: LibraryTilesetSummary };

// A tileset of the library: its sheet, how it is divided and, in the ring, how
// much of it already has a category. The whole card opens the editor, and the
// menu on the corner holds the other actions.
export const TilesetCard = ({ tileset }: Props) => (
    <div className="hover:bg-muted/20 relative flex flex-col gap-3 overflow-hidden rounded-lg border p-3 transition-colors">
        <Link
            to="/admin/tilesets/$tilesetId"
            params={{ tilesetId: tileset.id }}
            aria-label={`Editar ${tileset.name}`}
            className="absolute inset-0 z-0"
        />
        <div className="bg-muted/30 pointer-events-none flex h-40 items-center justify-center overflow-hidden rounded-md">
            <img
                src={resolveFileUrl(tileset.url, API_BASE_URL)}
                alt={tileset.name}
                className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
            />
        </div>
        <div className="flex items-center justify-between gap-2">
            <div className="pointer-events-none flex min-w-0 items-center gap-2.5">
                <TilesetProgressRing
                    percent={tileset.progressPercent}
                    taggedCount={tileset.taggedCount}
                    tileCount={tileset.tileCount}
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {tileset.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                        <TilesetShape tileset={tileset} />
                    </p>
                </div>
            </div>
            <div className="relative z-10">
                <TilesetActions tileset={tileset} />
            </div>
        </div>
    </div>
);
