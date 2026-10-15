import type Phaser from "phaser";
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
        | "requestDeskRemoval"
    >;
    setHint: (text: string | null) => void;
    // The region the tools may fill, such as the frame of an area. Without it,
    // or when it returns null, the whole map.
    getBounds?: () => TileRect | null;
    // The picture of a region of the map in tiles, at native resolution.
    captureSnapshot?: (rect: TileRect) => Promise<Blob>;
};
