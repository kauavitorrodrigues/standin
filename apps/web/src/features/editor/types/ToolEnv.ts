import type Phaser from "phaser";
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
        | "setSelection"
        | "clearSelection"
        | "requestDeskRemoval"
    >;
    setHint: (text: string | null) => void;
};
