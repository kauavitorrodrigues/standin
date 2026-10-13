import { useRef, useState, type PointerEvent } from "react";
import { TILE_SIZE } from "@standin/contracts";
import { DEFAULT_ZOOM, type Zoom } from "../consts/editorZoom";
import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";
import type { ImageSize } from "../queries/useImageSize";
import type { Cell, Crop, Footprint } from "../types/spriteGeometry";
import { getEditorMode } from "../utils/getEditorMode";
import {
    getCropFromCells,
    getFootprintFromCells,
    getFrameCrop,
    hasCrop,
    suggestFootprint,
    toFirstFrameCells,
} from "../utils/spriteGeometry";

type Params = {
    size: ImageSize | undefined;
    crop: Crop;
    // 1 for a static asset, the frames of the strip otherwise. The footprint
    // is marked on one frame.
    frameCount: number;
    // Without it the crop is fixed, and only the footprint is marked.
    onMarkCrop?: (crop: Crop, footprint: Footprint) => void;
    onMarkFootprint: (footprint: Footprint) => void;
    // The crop is already the whole image, so only the footprint is marked.
    footprintOnly?: boolean;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

// The state of the visual editor and what a drag over the image does: in crop
// mode it marks the crop (and suggests a footprint for it), in footprint mode
// it marks the footprint inside the crop.
export const useSpriteEditor = ({
    size,
    crop,
    frameCount,
    onMarkCrop,
    onMarkFootprint,
    footprintOnly = false,
}: Params) => {
    const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
    const [chosenMode, setMode] = useState<EditorMode>(EDITOR_MODES.CROP);
    const dragStart = useRef<Cell | null>(null);

    const mode = getEditorMode({
        chosenMode,
        hasCrop: hasCrop(crop),
        footprintOnly,
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
            onMarkCrop(next, suggestFootprint(getFrameCrop(next, frameCount)));
            return;
        }
        const frame = getFrameCrop(crop, frameCount);
        const [from, to] = toFirstFrameCells(crop, frame, start, end);
        onMarkFootprint(getFootprintFromCells(frame, from, to));
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const cell = getCell(event);
        dragStart.current = cell;
        mark(cell, cell);
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        if (dragStart.current) mark(dragStart.current, getCell(event));
    };

    const onPointerUp = () => {
        if (!dragStart.current) return;
        dragStart.current = null;
        // A new crop is followed by its footprint.
        if (mode === EDITOR_MODES.CROP) setMode(EDITOR_MODES.FOOTPRINT);
    };

    return {
        zoom,
        setZoom,
        mode,
        setMode,
        pointerHandlers: { onPointerDown, onPointerMove, onPointerUp },
    };
};
