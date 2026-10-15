import { useRef, useState, type PointerEvent } from "react";
import { TILE_SIZE } from "@standin/contracts";
import { DEFAULT_ZOOM, type Zoom } from "../consts/editorZoom";
import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";
import { SPRITE_TOOLS, type SpriteTool } from "../consts/spriteTools";
import { NO_FOOTPRINT } from "../consts/spriteGeometry";
import type { ImageSize } from "../queries/useImageSize";
import type {
    FootprintMasks,
    FootprintTile,
    SolidPaintAction,
} from "../types/footprintMask";
import type { Cell, Crop, Footprint } from "../types/spriteGeometry";
import { getEditorMode } from "../utils/getEditorMode";
import {
    canHaveMask,
    countOccupiedTiles,
    getTileAtCell,
    isTileOccupied,
} from "../utils/footprintMask";
import { getEffectiveTool } from "../utils/getModeTools";
import { getCellsBetween } from "../utils/solidMask";
import { useCollisionPainter } from "./useCollisionPainter";
import {
    getCropFromCells,
    getFootprintFromCells,
    getFrameCrop,
    hasCrop,
    hasFootprint,
    toFirstFrameCells,
} from "../utils/spriteGeometry";

type Params = {
    size: ImageSize | undefined;
    crop: Crop;
    // 1 for a static asset, the frames of the strip otherwise. The footprint
    // is marked on one frame.
    frameCount: number;
    // Without it the crop is fixed, and only the footprint is marked.
    onMarkCrop?: (crop: Crop) => void;
    onMarkFootprint: (footprint: Footprint) => void;
    // The eraser on the crop layer. Left out when the crop is fixed.
    onEraseCrop?: () => void;
    footprint: Footprint;
    // Frees or occupies a tile of the footprint, left out when the footprint
    // cannot have a mask.
    onToggleTile?: (tile: FootprintTile) => void;
    // The crop is already the whole image, so only the footprint is marked.
    footprintOnly?: boolean;
    // The two masks of the footprint, which the collision mode paints.
    masks: FootprintMasks;
    // Left out when the collision cannot be painted.
    onChangeSolid?: (masks: FootprintMasks) => void;
    // Whether the collision mode is available for this asset.
    canCollide: boolean;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

// The state of the visual editor and what a drag over the image does. The
// layer being edited and its tool decide: the rectangle marks the crop (and
// suggests a footprint for it) or the footprint inside the crop, the brush
// occupies or frees the tiles of the footprint, and the collision layer
// paints cells.
export const useSpriteEditor = ({
    size,
    crop,
    frameCount,
    onMarkCrop,
    onMarkFootprint,
    onEraseCrop,
    footprint,
    onToggleTile,
    footprintOnly = false,
    masks,
    onChangeSolid,
    canCollide,
}: Params) => {
    const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
    const [chosenMode, setMode] = useState<EditorMode>(EDITOR_MODES.CROP);
    const [chosenTool, setTool] = useState<SpriteTool>(SPRITE_TOOLS.RECT);
    const dragStart = useRef<Cell | null>(null);
    // The cell the last pointer event of a tile stroke reached, and the tiles
    // it already changed, so a tile changes once per stroke.
    const lastCell = useRef<Cell | null>(null);
    const visitedTiles = useRef<Set<string>>(new Set());
    // The tile under the pointer when the brush would change it.
    const [hoveredTile, setHoveredTile] = useState<FootprintTile | null>(null);

    const mode = getEditorMode({
        chosenMode,
        hasCrop: hasCrop(crop),
        footprintOnly,
        canCollide,
    });
    const canPaintTiles = onToggleTile !== undefined && canHaveMask(footprint);
    const tool = getEffectiveTool(mode, chosenTool, canPaintTiles);
    // The eraser paints "erase", every other tool paints.
    const action: SolidPaintAction =
        tool === SPRITE_TOOLS.ERASE ? "erase" : "paint";
    const painter = useCollisionPainter({
        zoom,
        frame: getFrameCrop(crop, frameCount),
        footprint,
        masks,
        tool,
        action,
        onChange: onChangeSolid,
    });
    const isPainting = mode === EDITOR_MODES.COLLISION;
    // The brush and the eraser of the footprint work tile by tile.
    const isTileBrush =
        mode === EDITOR_MODES.FOOTPRINT &&
        hasFootprint(footprint) &&
        (tool === SPRITE_TOOLS.BRUSH || tool === SPRITE_TOOLS.ERASE);

    const getCell = (event: PointerEvent<HTMLElement>): Cell => {
        const rect = event.currentTarget.getBoundingClientRect();
        const cellPx = TILE_SIZE * zoom;
        const lastCol = Math.ceil((size?.w ?? 0) / TILE_SIZE) - 1;
        const lastRow = Math.ceil((size?.h ?? 0) / TILE_SIZE) - 1;
        return {
            col: clamp(
                Math.floor((event.clientX - rect.left) / cellPx),
                lastCol
            ),
            row: clamp(
                Math.floor((event.clientY - rect.top) / cellPx),
                lastRow
            ),
        };
    };

    const mark = (start: Cell, end: Cell) => {
        if (mode === EDITOR_MODES.CROP) {
            if (!onMarkCrop) return;
            const next = getCropFromCells(start, end);
            onMarkCrop(next);
            return;
        }
        const frame = getFrameCrop(crop, frameCount);
        const [from, to] = toFirstFrameCells(crop, frame, start, end);
        onMarkFootprint(getFootprintFromCells(frame, from, to));
    };

    // The tile of the footprint under a cell.
    const getTile = (cell: Cell): FootprintTile | null => {
        const frame = getFrameCrop(crop, frameCount);
        const [inFrame] = toFirstFrameCells(crop, frame, cell, cell);
        return getTileAtCell(frame, footprint, inFrame);
    };

    // Occupies or frees the tiles a stroke crosses, each only once and only
    // when it is not already the way the tool leaves it. Erasing the last
    // occupied tile takes the whole footprint away.
    const brushTiles = (cells: Cell[]) => {
        const wanted = action === "paint";
        for (const cell of cells) {
            const tile = getTile(cell);
            if (!tile) continue;
            const key = `${tile.col},${tile.row}`;
            if (visitedTiles.current.has(key)) continue;
            visitedTiles.current.add(key);
            if (isTileOccupied(masks.mask, tile) === wanted) continue;
            if (!wanted && countOccupiedTiles(footprint, masks.mask) <= 1) {
                onMarkFootprint(NO_FOOTPRINT);
                continue;
            }
            onToggleTile?.(tile);
        }
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        if (isPainting) return painter.pointerHandlers.onPointerDown(event);
        if (mode === EDITOR_MODES.CROP && tool === SPRITE_TOOLS.ERASE) {
            return onEraseCrop?.();
        }
        // Only the rectangle marks. The other tools never start a mark, even
        // where they have nothing to act on.
        if (tool !== SPRITE_TOOLS.RECT && !isTileBrush) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const cell = getCell(event);
        dragStart.current = cell;
        if (isTileBrush) {
            visitedTiles.current = new Set();
            lastCell.current = cell;
            brushTiles([cell]);
            return;
        }
        mark(cell, cell);
    };

    const updateHoveredTile = (tile: FootprintTile | null) => {
        setHoveredTile((current) => {
            if (current?.col === tile?.col && current?.row === tile?.row) {
                return current;
            }
            return tile;
        });
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        if (isPainting) return painter.pointerHandlers.onPointerMove(event);
        const cell = getCell(event);
        const start = dragStart.current;
        if (!start) {
            updateHoveredTile(isTileBrush ? getTile(cell) : null);
            return;
        }
        if (isTileBrush) {
            brushTiles(getCellsBetween(lastCell.current ?? cell, cell));
            lastCell.current = cell;
            return;
        }
        mark(start, cell);
    };

    const onPointerUp = () => {
        if (isPainting) return painter.pointerHandlers.onPointerUp();
        if (!dragStart.current) return;
        dragStart.current = null;
        lastCell.current = null;
    };

    const onPointerLeave = () => {
        updateHoveredTile(null);
        painter.pointerHandlers.onPointerLeave();
    };

    return {
        zoom,
        setZoom,
        mode,
        setMode,
        tool,
        setTool,
        canPaintTiles,
        hoveredTile,
        hoveredCell: painter.hoveredCell,
        pointerHandlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerLeave,
        },
    };
};
