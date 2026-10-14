import { useRef, useState, type PointerEvent } from "react";
import type { Zoom } from "../consts/editorZoom";
import { SOLID_CELL_PX } from "../consts/solidMask";
import { SPRITE_TOOLS, type SpriteTool } from "../consts/spriteTools";
import type {
    FootprintMasks,
    SolidCell,
    SolidPaintAction,
} from "../types/footprintMask";
import type { Crop, Footprint } from "../types/spriteGeometry";
import {
    getCellsBetween,
    getFloodCells,
    getRectCells,
    isCellInside,
    paintSolidCells,
} from "../utils/solidMask";
import { getFootprintRect } from "../utils/spriteGeometry";

type Params = {
    zoom: Zoom;
    frame: Crop;
    footprint: Footprint;
    masks: FootprintMasks;
    tool: SpriteTool;
    // What the tool does to the cells: paint them solid or erase them.
    action: SolidPaintAction;
    onChange?: (masks: FootprintMasks) => void;
};

// A press on the canvas that is painting: where it started, the last cell it
// reached, the masks it started from and the ones it has built so far. The
// masks are kept here because the form may not have re-rendered between two
// pointer events.
type Stroke = {
    start: SolidCell;
    last: SolidCell;
    base: FootprintMasks;
    masks: FootprintMasks;
};

// What a press and a drag do in the collision layer. The brush acts on every
// cell the pointer crosses, the rectangle on the block between the press and
// the pointer (and follows the pointer, so it can shrink), the bucket on the
// whole area around the cell, with one click.
export const useCollisionPainter = ({
    zoom,
    frame,
    footprint,
    masks,
    tool,
    action,
    onChange,
}: Params) => {
    const stroke = useRef<Stroke | null>(null);
    const [hoveredCell, setHoveredCell] = useState<SolidCell | null>(null);

    // The cell under the pointer. It may be outside the footprint, which a
    // stroke needs to cross the edge without a gap.
    const getCell = (event: PointerEvent<HTMLElement>): SolidCell => {
        const rect = event.currentTarget.getBoundingClientRect();
        const origin = getFootprintRect(frame, footprint);
        return {
            col: Math.floor(
                ((event.clientX - rect.left) / zoom - origin.x) / SOLID_CELL_PX
            ),
            row: Math.floor(
                ((event.clientY - rect.top) / zoom - origin.y) / SOLID_CELL_PX
            ),
        };
    };

    const updateHovered = (cell: SolidCell | null) => {
        setHoveredCell((current) => {
            if (current?.col === cell?.col && current?.row === cell?.row) {
                return current;
            }
            return cell;
        });
    };

    const hoverInside = (cell: SolidCell) => {
        if (isCellInside(footprint, cell)) {
            updateHovered(cell);
            return;
        }
        updateHovered(null);
    };

    const commit = (current: Stroke, next: FootprintMasks) => {
        if (next === current.masks) return;
        current.masks = next;
        onChange?.(next);
    };

    const paint = (from: FootprintMasks, cells: SolidCell[]) =>
        paintSolidCells({ footprint, masks: from, cells, action });

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        const cell = getCell(event);
        if (!isCellInside(footprint, cell)) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateHovered(cell);
        const current: Stroke = {
            start: cell,
            last: cell,
            base: masks,
            masks,
        };
        if (tool === SPRITE_TOOLS.BUCKET) {
            commit(
                current,
                paint(masks, getFloodCells(footprint, masks, cell))
            );
            return;
        }
        stroke.current = current;
        commit(current, paint(masks, [cell]));
    };

    const continueStroke = (current: Stroke, cell: SolidCell) => {
        if (tool === SPRITE_TOOLS.RECT) {
            commit(
                current,
                paint(current.base, getRectCells(current.start, cell))
            );
            return;
        }
        commit(
            current,
            paint(current.masks, getCellsBetween(current.last, cell))
        );
        current.last = cell;
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        const cell = getCell(event);
        hoverInside(cell);
        const current = stroke.current;
        if (!current) return;
        continueStroke(current, cell);
    };

    const onPointerUp = () => {
        stroke.current = null;
    };

    const onPointerLeave = () => updateHovered(null);

    return {
        hoveredCell,
        pointerHandlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerLeave,
        },
    };
};
