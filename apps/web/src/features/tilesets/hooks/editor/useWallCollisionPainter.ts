import { useRef, type PointerEvent } from "react";
import { getCellsBetween } from "@/features/assets/utils/solidMask";
import { WALL_PAINT_ACTIONS, type WallPaintAction } from "../../consts/wall";
import { getWallCellFromPointer } from "../../utils/editor/wall/getWallCellFromPointer";
import {
    resolveWallCollision,
    type WallCell,
} from "../../utils/editor/wall/paintWallCollision";
import { useTileEditorContext } from "./useEditorContext";

type Params = {
    index: number;
    // The tile as drawn, in px.
    drawnSizePx: number;
};

type Stroke = { action: WallPaintAction; last: WallCell };

// What a press and a drag do on the collision grid of one wall tile. The
// first cell decides the stroke: pressing a solid cell erases while the
// pointer drags, pressing a free one paints. A drag that skips cells fills
// the line between them, and the whole stroke is one step of the history.
export const useWallCollisionPainter = ({ index, drawnSizePx }: Params) => {
    const { meta, wall } = useTileEditorContext();
    const stroke = useRef<Stroke | null>(null);

    const getCell = (event: PointerEvent<HTMLElement>): WallCell => {
        const rect = event.currentTarget.getBoundingClientRect();
        return getWallCellFromPointer(
            event.clientX - rect.left,
            event.clientY - rect.top,
            drawnSizePx
        );
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        const cell = getCell(event);
        const solid = resolveWallCollision(meta, index)[cell.row][cell.col];
        const action = solid
            ? WALL_PAINT_ACTIONS.ERASE
            : WALL_PAINT_ACTIONS.PAINT;
        event.currentTarget.setPointerCapture(event.pointerId);
        stroke.current = { action, last: cell };
        wall.beginStroke();
        wall.paintCells(index, [cell], action);
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        const current = stroke.current;
        if (!current) return;
        const cell = getCell(event);
        wall.paintCells(
            index,
            getCellsBetween(current.last, cell),
            current.action
        );
        current.last = cell;
    };

    const onPointerUp = () => {
        if (!stroke.current) return;
        stroke.current = null;
        wall.endStroke();
    };

    return { onPointerDown, onPointerMove, onPointerUp };
};
