import type { TileMeta } from "@standin/contracts";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";
import { ZoomControls } from "@/features/editor/components/views/ZoomControls";
import {
    DEFAULT_TILE_ZOOM,
    TILE_ZOOMS,
    type TileZoom,
} from "../../../../consts/sheetZoom";
import type { TileSheetGrid } from "../../../../types/sheet";
import { getNextTileZoom } from "../../../../utils/editor/getNextTileZoom";
import { TileInfoChip } from "./Chip";

type Props = {
    grid: TileSheetGrid;
    meta: TileMeta;
    hovered: number | null;
    selectedCount: number;
    zoom: TileZoom;
    onZoomChange: (zoom: TileZoom) => void;
};

// What floats over the bottom of the sheet: the tile under the pointer and
// the selection on the left, the zoom on the right.
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
            <ZoomControls
                zoom={zoom}
                canZoomIn={zoom < TILE_ZOOMS[TILE_ZOOMS.length - 1]!}
                canZoomOut={zoom > TILE_ZOOMS[0]}
                onZoomIn={() => onZoomChange(getNextTileZoom(zoom, 1))}
                onZoomOut={() => onZoomChange(getNextTileZoom(zoom, -1))}
                onReset={() => onZoomChange(DEFAULT_TILE_ZOOM)}
                resetLabel="Voltar ao zoom padrão"
            />
        </FloatingPanel>
    </>
);
