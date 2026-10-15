import type Phaser from "phaser";
import type { EditorModel, EditorOp, Zone } from "@standin/contracts";
import type { TileRect } from "@/features/editor/types/tile-rect";
import type { EditorStore } from "@/features/editor/lib/EditorStore";

// What a tool can use to build itself: the scene to draw previews in, the
// store to read `placing` or `brush`, and the hint line.
export type ToolEnv = {
    scene: Phaser.Scene;
    store: Pick<
        EditorStore,
        | "getState"
        | "subscribe"
        | "pickTile"
        | "cancelPlacing"
        | "cancelPlacingArea"
        | "setSelection"
        | "clearSelection"
        | "setDraggedId"
        | "requestDeskRemoval"
    >;
    setHint: (text: string | null) => void;
    // Asks, before a tool sends operations to the draft, whether the host
    // refuses them for a reason of its own (the decorator does not let a desk
    // of someone else be touched). It answers the text of the hint, or null
    // when the operations may go. A tool shows the refusal as a red ghost.
    veto?: (
        ops: readonly EditorOp[],
        model: Readonly<EditorModel>
    ) => string | null;
    // The region the tools may fill, such as the frame of an area. Without it,
    // or when it returns null, the whole map.
    getBounds?: () => TileRect | null;
    // The rooms the door rule reads instead of the zones of the model. The
    // area composer has no zones, so it answers the rectangle of the area
    // when the area is a room and an empty list when it is not. Without it, or
    // when it returns null, the zones of the model count.
    getDoorRooms?: () => readonly Zone[] | null;
    // The picture of a region of the map in tiles, at native resolution.
    captureSnapshot?: (rect: TileRect) => Promise<Blob>;
};
