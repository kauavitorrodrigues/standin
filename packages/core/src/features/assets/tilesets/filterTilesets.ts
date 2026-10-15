import type {
    LibraryFacetOption,
    LibraryTilesetFacets,
    LibraryTilesetQuerySchemaType,
    LibraryTilesetSummary,
} from "@standin/contracts";
import { LIBRARY_TILESET_PROGRESS } from "@standin/contracts";

const isComplete = ({ taggedCount, tileCount }: LibraryTilesetSummary) =>
    taggedCount === tileCount;

const countOption = (
    tilesets: LibraryTilesetSummary[],
    value: string,
    label: string,
    matches: (tileset: LibraryTilesetSummary) => boolean
): LibraryFacetOption => ({
    value,
    label,
    count: tilesets.filter(matches).length,
});

/** The tilesets that match the search and every filter chosen. */
export const filterTilesets = (
    tilesets: LibraryTilesetSummary[],
    { search, inUse, progress }: Partial<LibraryTilesetQuerySchemaType>
): LibraryTilesetSummary[] => {
    const term = search?.toLowerCase();
    return tilesets.filter((tileset) => {
        if (term && !tileset.name.toLowerCase().includes(term)) return false;
        if (inUse !== undefined && tileset.inUse !== inUse) return false;
        switch (progress) {
            case LIBRARY_TILESET_PROGRESS.COMPLETE:
                return isComplete(tileset);
            case LIBRARY_TILESET_PROGRESS.INCOMPLETE:
                return !isComplete(tileset);
            default:
                return true;
        }
    });
};

/** The options of every filter, with how many tilesets each holds. */
export const buildTilesetFacets = (
    tilesets: LibraryTilesetSummary[]
): LibraryTilesetFacets => ({
    usage: [
        countOption(tilesets, "true", "Em uso", ({ inUse }) => inUse),
        countOption(tilesets, "false", "Livre", ({ inUse }) => !inUse),
    ],
    progress: [
        countOption(
            tilesets,
            LIBRARY_TILESET_PROGRESS.COMPLETE,
            "Completo",
            isComplete
        ),
        countOption(
            tilesets,
            LIBRARY_TILESET_PROGRESS.INCOMPLETE,
            "Incompleto",
            (tileset) => !isComplete(tileset)
        ),
    ],
});
