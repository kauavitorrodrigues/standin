import { useRef, type PointerEvent } from "react";
import type { TileZoom } from "../../consts/sheetZoom";
import type {
    SelectionMode,
    TileBrush,
    TileSheetGrid,
    TileTool,
} from "../../types/sheet";
import { combineSelection } from "../../utils/editor/combineSelection";
import { getSelectionMode } from "../../utils/editor/getSelectionMode";
import { getTileAt, getTileRect } from "../../utils/editor/getAt";
import { getTileLine } from "../../utils/editor/getLine";
import { getTileShape } from "../../utils/editor/getShape";
import { isShapeTool } from "../../utils/editor/toolRules";

type Params = {
    grid: TileSheetGrid;
    zoom: TileZoom;
    tool: TileTool;
    brush: TileBrush;
    disabled: boolean;
    selected: number[];
    onSelect: (selected: number[]) => void;
    onHover: (index: number | null) => void;
    onPaint: (brush: TileBrush, indices: number[]) => void;
    onErase: (indices: number[]) => void;
    onFill: (brush: TileBrush, index: number) => void;
    onPickBrush: (index: number) => void;
    onDefault: (index: number) => void;
    onTop: (index: number) => void;
    // Selects the tiles that share the category of the tile (the ones that
    // touch it, or all of them), joined to the selection the way the mode says.
    onWand: (index: number, mode: SelectionMode) => void;
    onSame: (index: number, mode: SelectionMode) => void;
    // A stroke is from the press of the pointer to its release, and it is one
    // step to undo.
    onStrokeStart: () => void;
    onStrokeEnd: () => void;
};

// `shape` is what a line or a rectangle covers so far, painted on release.
// `base` is what was selected when the drag began, and `mode` how the drag
// joins it.
type Drag = {
    anchor: number;
    base: number[];
    mode: SelectionMode;
    last: number;
    shape: number[];
};

// What the pointer does over the sheet. A drag selects tiles, paints the brush,
// erases or draws a line or a rectangle with it (shown as the selection until
// the pointer is released). A click fills with the bucket, takes the brush with
// the picker, or selects by category with the wand. The default tool makes
// the tile the default of the blank map, and the top tool is a click on a wall
// and another on its top. Shift adds to the selection, ctrl takes from it. Shift with the brush draws a straight line from the tile
// painted last.
export const useTileSheetPointer = ({
    grid,
    zoom,
    tool,
    brush,
    disabled,
    selected,
    onSelect,
    onHover,
    onPaint,
    onErase,
    onFill,
    onPickBrush,
    onDefault,
    onTop,
    onWand,
    onSame,
    onStrokeStart,
    onStrokeEnd,
}: Params) => {
    const drag = useRef<Drag | null>(null);
    const lastPainted = useRef<number | null>(null);

    const getTile = (event: PointerEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return getTileAt(
            {
                x: (event.clientX - rect.left) / zoom,
                y: (event.clientY - rect.top) / zoom,
            },
            grid
        );
    };

    const startDrag = (
        index: number,
        mode: SelectionMode,
        shape: number[] = []
    ) => {
        drag.current = {
            anchor: index,
            base: selected,
            mode,
            last: index,
            shape,
        };
    };

    const paint = (index: number) => {
        lastPainted.current = index;
        onPaint(brush, [index]);
    };

    const startPaint = (index: number, straight: boolean) => {
        startDrag(index, "replace");
        const from = lastPainted.current;
        if (!straight || from === null) return paint(index);
        lastPainted.current = index;
        onPaint(brush, getTileLine(from, index, grid.columns));
    };

    const startErase = (index: number) => {
        startDrag(index, "replace");
        onErase([index]);
    };

    const startShape = (index: number) => {
        startDrag(index, "replace", [index]);
        onSelect([index]);
    };

    const startSelect = (index: number, mode: SelectionMode) => {
        startDrag(index, mode);
        onSelect(combineSelection(selected, [index], mode));
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const index = getTile(event);
        const mode = getSelectionMode(event);
        onStrokeStart();

        switch (tool) {
            case "paint":
                return startPaint(index, event.shiftKey);
            case "erase":
                return startErase(index);
            case "line":
            case "rect":
                return startShape(index);
            case "bucket":
                return onFill(brush, index);
            case "picker":
                return onPickBrush(index);
            case "wand":
                return onWand(index, mode);
            case "same":
                return onSame(index, mode);
            case "default":
                return onDefault(index);
            case "top":
                return onTop(index);
            case "pan":
                return;
            default:
                return startSelect(index, mode);
        }
    };

    const continueDrag = (current: Drag, index: number) => {
        if (isShapeTool(tool)) {
            current.shape = getTileShape(
                tool,
                current.anchor,
                index,
                grid.columns
            );
            return onSelect(current.shape);
        }
        if (tool === "paint") return paint(index);
        if (tool === "erase") return onErase([index]);
        if (tool !== "select") return;
        const rect = getTileRect(current.anchor, index, grid.columns);
        onSelect(combineSelection(current.base, rect, current.mode));
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        const index = getTile(event);
        onHover(index);
        const current = drag.current;
        if (!current || index === current.last) return;
        current.last = index;
        continueDrag(current, index);
    };

    const onPointerUp = () => {
        const current = drag.current;
        drag.current = null;
        if (current && isShapeTool(tool)) onPaint(brush, current.shape);
        onStrokeEnd();
    };

    const onPointerLeave = () => onHover(null);

    return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave };
};
