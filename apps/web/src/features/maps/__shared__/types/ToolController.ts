import type { Cell, EditorModel, EditorOp } from "@standin/contracts";
import type { DraftGestureResult } from "@/features/maps/__shared__/types/DraftGestureResult";

// What a tool gets with every pointer event. The model is the draft as it is
// now and must not be changed: a tool changes the map only through `dispatch`.
export type ToolContext = {
    // The cell under the pointer. Always inside the map.
    cell: Cell;
    // The pointer in world px, for tools that hit test sprites.
    worldX: number;
    worldY: number;
    button: number;
    alt: boolean;
    shift: boolean;
    ctrl: boolean;
    model: Readonly<EditorModel>;
    // Sends ALL the operations of one gesture to the draft, as a single undo step.
    dispatch: (ops: readonly EditorOp[]) => DraftGestureResult;
    // One line on the bottom of the canvas. Null clears it.
    setHint: (text: string | null) => void;
};

// A tool implements only what it uses.
export type ToolController = {
    onActivate?: () => void;
    onDeactivate?: () => void;
    onPointerDown?: (context: ToolContext) => void;
    onPointerMove?: (context: ToolContext) => void;
    onPointerUp?: (context: ToolContext) => void;
    // The pointer left the map (or the canvas, or started to pan) with no
    // gesture running. A ghost or a preview goes away here.
    onPointerLeave?: () => void;
    // Esc, a lost lock, or a publish started in the middle of a gesture.
    onCancel?: () => void;
};
