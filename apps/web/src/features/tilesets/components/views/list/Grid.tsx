import type { LibraryTilesetSummary } from "@standin/contracts";
import { TilesetCard } from "../card/Card";

type Props = { tilesets: LibraryTilesetSummary[] };

export const TilesetsGrid = ({ tilesets }: Props) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
        {tilesets.map((tileset) => (
            <TilesetCard key={tileset.id} tileset={tileset} />
        ))}
    </div>
);
