import { MAX_TILESETS_PER_MAP } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import { TILE_HINTS } from "@/features/maps/__shared__/consts/messages";

// The warning for a map that ends up with more tilesets than
// MAX_TILESETS_PER_MAP, or null. `painting` is the tileset the gesture paints
// with: when the layout does not have it yet, painting adds it. It only
// warns, painting is never blocked by it.
export const getTilesetLimitHint = (
    layout: Pick<EditorModel["layout"], "tilesets">,
    painting: string | null
): string | null => {
    const known = layout.tilesets.some(({ name }) => name === painting);
    const adds = painting !== null && !known;
    const total = layout.tilesets.length + (adds ? 1 : 0);
    if (total <= MAX_TILESETS_PER_MAP) return null;

    return `${TILE_HINTS.TILESET_LIMIT_PREFIX} ${MAX_TILESETS_PER_MAP} ${TILE_HINTS.TILESET_LIMIT_SUFFIX}`;
};
