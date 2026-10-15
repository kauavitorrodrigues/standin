import type { TileMeta } from "@standin/contracts";
import { InfoChip } from "@/components/editor/InfoChip";
import type { TileSheetGrid } from "../../../../types/sheet";
import { TileHoverInfo } from "./Hover";
import { TileSelectionCount } from "./Selection";

type Props = {
    grid: TileSheetGrid;
    meta: TileMeta;
    hovered: number | null;
    selectedCount: number;
};

// What is under the pointer and how many tiles are selected, floating on the
// bottom left of the sheet. It is only there while there is something to say.
export const TileInfoChip = ({ grid, meta, hovered, selectedCount }: Props) => {
    if (hovered === null && selectedCount === 0) return null;

    return (
        <InfoChip>
            <TileSelectionCount count={selectedCount} />
            <TileHoverInfo hovered={hovered} grid={grid} meta={meta} />
        </InfoChip>
    );
};
