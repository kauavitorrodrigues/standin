import type { LibraryTilesetSummary } from "@standin/contracts";
import { TilesetsGrid } from "./Grid";
import { TilesetsNoResultsState } from "./NoResultsState";

type Props = { tilesets: LibraryTilesetSummary[] };

// The grid, or why the search and the filters left it empty.
export const TilesetsContent = ({ tilesets }: Props) => {
    if (tilesets.length === 0) return <TilesetsNoResultsState />;
    return <TilesetsGrid tilesets={tilesets} />;
};
