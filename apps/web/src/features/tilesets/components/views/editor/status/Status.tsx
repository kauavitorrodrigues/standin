import type { TileMeta } from "@standin/contracts";
import type { TileZoom } from "../../../../consts/sheetZoom";
import type { TileSheetGrid } from "../../../../types/sheet";
import { FloatingPanel } from "../../../layout/FloatingPanel";
import { TileInfoChip } from "./Chip";
import { TileZoomControls } from "../tools/Zoom";

type Props = {
    grid: TileSheetGrid;
    meta: TileMeta;
    hovered: number | null;
    selectedCount: number;
    zoom: TileZoom;
    onZoomChange: (zoom: TileZoom) => void;
};

// What the old status bar said, floating over the bottom of the sheet: the
// tile under the pointer and the selection on the left, the zoom on the right.
export const TileStatusOverlay = ({
    grid,
    meta,
    hovered,
    selectedCount,
    zoom,
    onZoomChange,
}: Props) => (
    <>
        <TileInfoChip
            grid={grid}
            meta={meta}
            hovered={hovered}
            selectedCount={selectedCount}
        />
        <FloatingPanel className="text-muted-foreground right-3 bottom-3 p-1 text-xs">
            <TileZoomControls zoom={zoom} onZoomChange={onZoomChange} />
        </FloatingPanel>
    </>
);
