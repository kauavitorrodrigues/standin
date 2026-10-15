import type { TileMeta } from "@standin/contracts";
import type { TileSheetGrid } from "../../../../types/sheet";
import { FloatingPanel } from "../../../layout/FloatingPanel";
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
        <FloatingPanel className="text-muted-foreground bottom-3 left-3 flex max-w-[calc(100%-10rem)] items-center gap-3 px-3 py-1.5 text-xs">
            <TileSelectionCount count={selectedCount} />
            <TileHoverInfo hovered={hovered} grid={grid} meta={meta} />
        </FloatingPanel>
    );
};
