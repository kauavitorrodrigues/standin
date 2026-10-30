import type {
    AreaSummary,
    LibraryFamilySummary,
    LibraryOverview,
    LibraryTilesetSummary,
} from "@standin/contracts";
import type { LibraryListResult } from "../../types";

// The columns a person or an agent needs to write a spec; the rest of what
// the server sends (urls, thumbnails, facets) is left out.
export const buildLibraryListResult = (
    overview: LibraryOverview,
    tilesets: LibraryTilesetSummary[],
    families: LibraryFamilySummary[],
    areas: AreaSummary[]
): LibraryListResult => ({
    categories: overview.groups.map(({ category, label, count }) => ({
        category,
        label,
        count,
    })),
    tilesets: tilesets.map(({ id, key, name, tileCount }) => ({
        id,
        key,
        name,
        tileCount,
    })),
    assets: families.map(({ key, name, type, category, variantCount }) => ({
        key,
        name,
        type,
        category,
        variantCount,
    })),
    areas: areas.map(({ id, name, width, height }) => ({
        id,
        name,
        width,
        height,
    })),
});
