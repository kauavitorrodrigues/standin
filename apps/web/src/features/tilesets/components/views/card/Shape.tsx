import type { LibraryTilesetSummary } from "@standin/contracts";
import { formatLabel } from "@/utils/text";
import { TilesetInUseNote } from "../detail/InUseNote";

type Props = { tileset: LibraryTilesetSummary };

// How the sheet is divided and how many tiles it has.
export const TilesetShape = ({ tileset }: Props) => {
    const rows = tileset.tileCount / tileset.columns;
    const tiles = formatLabel(tileset.tileCount, "tile", { plural: "tiles" });

    return (
        <>
            {tileset.columns} × {rows}, {tiles}
            <TilesetInUseNote inUse={tileset.inUse} />
        </>
    );
};
