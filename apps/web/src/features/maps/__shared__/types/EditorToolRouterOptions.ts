import type { EditorModel, EditorOp } from "@standin/contracts";
import type { DraftGestureResult } from "@/features/maps/__shared__/types/DraftGestureResult";
import type { EditorTool } from "@/features/maps/__shared__/types/tool";
import type { EditabilityState } from "@/features/maps/__shared__/types/EditabilityState";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import type { ToolInputSource } from "@/features/maps/__shared__/types/ToolInput";
import type { ToolRegistry } from "@/features/maps/__shared__/types/ToolRegistry";

export type EditorToolRouterOptions = {
    registry: ToolRegistry;
    // Pointer events, already free of Phaser.
    source: ToolInputSource;
    // The slice of the editor store the router reads.
    store: {
        getState: () => EditabilityState & { tool: EditorTool };
        subscribe: (listener: () => void) => () => void;
    };
    // Passed to every factory, with the router's own setHint.
    env: Omit<ToolEnv, "setHint">;
    columns: number;
    rows: number;
    isSpaceHeld: () => boolean;
    getModel: () => Readonly<EditorModel>;
    dispatch: (ops: readonly EditorOp[]) => DraftGestureResult;
    // Writes the footer hint. Meant for the DOM, not for state.
    onHint: (text: string | null) => void;
};
