import { useRef, useState, type PointerEvent } from "react";
import { TILE_SIZE } from "@standin/contracts";
import { DEFAULT_ZOOM, type Zoom } from "../consts/editorZoom";
import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";
import { SPRITE_TOOLS, type SpriteTool } from "../consts/spriteTools";
import type { ImageSize } from "../queries/useImageSize";
import type {
    FootprintMasks,
    MaskLayer,
    SolidPaintAction,
} from "../types/footprintMask";
import type { Cell, Crop, Footprint } from "../types/spriteGeometry";
import { getEditorMode } from "../utils/getEditorMode";
import { getEffectiveTool } from "../utils/getModeTools";
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
    // The crop is already the whole image, so only the footprint is marked.
    footprintOnly?: boolean;
    // The two masks of the footprint, which the painter changes.
    masks: FootprintMasks;
    // Left out when the cells cannot be painted.
    onChangeSolid?: (masks: FootprintMasks) => void;
    // Whether the collision mode is available for this asset.
    canCollide: boolean;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

// The state of the visual editor and what a drag over the image does. The
// layer being edited and its tool decide: the rectangle marks the crop, or the
// footprint of an animated piece, and the footprint and collision layers of a
// still piece paint cells.
export const useSpriteEditor = ({
    size,
    crop,
    frameCount,
    onMarkCrop,
    onMarkFootprint,
    onEraseCrop,
    footprint,
    footprintOnly = false,
    masks,
    onChangeSolid,
    canCollide,
}: Params) => {
    const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
    const [chosenMode, setMode] = useState<EditorMode>(EDITOR_MODES.CROP);
    const [chosenTool, setTool] = useState<SpriteTool>(SPRITE_TOOLS.RECT);
    const dragStart = useRef<Cell | null>(null);

    const mode = getEditorMode({
        chosenMode,
        hasCrop: hasCrop(crop),
        footprintOnly,
        canCollide,
    });
    // A still piece has its footprint painted by cells, like the collision. The
    // footprint of an animated one is a rectangle, since it has no mask.
    const canPaintCells =
        onChangeSolid !== undefined &&
        frameCount <= 1 &&
        hasFootprint(footprint);
    const tool = getEffectiveTool(mode, chosenTool, canPaintCells);
    // The eraser paints "erase", every other tool paints.
    const action: SolidPaintAction =
        tool === SPRITE_TOOLS.ERASE ? "erase" : "paint";
    const isPainting =
        mode === EDITOR_MODES.COLLISION ||
        (mode === EDITOR_MODES.FOOTPRINT && canPaintCells);
    const layer: MaskLayer =
        mode === EDITOR_MODES.COLLISION ? "collision" : "footprint";
    const painter = useCollisionPainter({
        zoom,
        frame: getFrameCrop(crop, frameCount),
        footprint,
        masks,
        layer,
        tool,
        action,
        onChange: onChangeSolid,
    });
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

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        if (isPainting) return painter.pointerHandlers.onPointerDown(event);
        if (mode === EDITOR_MODES.CROP && tool === SPRITE_TOOLS.ERASE) {
            return onEraseCrop?.();
        }
        // Only the rectangle marks. The other tools never start a mark, even
        // where they have nothing to act on.
        if (tool !== SPRITE_TOOLS.RECT) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const cell = getCell(event);
        dragStart.current = cell;
        mark(cell, cell);
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        if (isPainting) return painter.pointerHandlers.onPointerMove(event);
        const start = dragStart.current;
        if (!start) return;
        mark(start, getCell(event));
    };

    const onPointerUp = () => {
        if (isPainting) return painter.pointerHandlers.onPointerUp();
        if (!dragStart.current) return;
        dragStart.current = null;
    };

    const onPointerLeave = () => painter.pointerHandlers.onPointerLeave();

    return {
        zoom,
        setZoom,
        mode,
        setMode,
        tool,
        setTool,
        canPaintCells,
        hoveredCell: painter.hoveredCell,
        pointerHandlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerLeave,
        },
    };
};
