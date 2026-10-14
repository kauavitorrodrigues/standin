import { TILE_HINTS } from "@/features/maps/__shared__/consts/messages";
import type { ToolContext } from "@/features/maps/__shared__/types/ToolController";
import type { TileGestureOps } from "@/features/maps/__shared__/types/tile-gesture-ops";
import { getConflictHint } from "@/features/maps/__shared__/utils/getConflictHint";
import { getTilesetLimitHint } from "@/features/maps/__shared__/utils/getTilesetLimitHint";

type CommitInput = {
    context: Pick<ToolContext, "model" | "dispatch" | "setHint">;
    gesture: TileGestureOps;
    // The tileset the gesture paints with. Null for an erase.
    painting: string | null;
};

// Sends the operations of a tile gesture as ONE gesture (one undo step) and
// writes the hint: why a failure happened, which cells were left out, or the
// warning of too many tilesets. With nothing to send, only the hint changes.
export const commitTileGesture = ({
    context,
    gesture,
    painting,
}: CommitInput): void => {
    const { model, dispatch, setHint } = context;

    if (gesture.ops.length > 0) {
        const result = dispatch(gesture.ops);
        if (!result.ok) {
            setHint(TILE_HINTS.GESTURE_FAILED);
            return;
        }
    }

    const hints = [
        getConflictHint(gesture.conflicts),
        gesture.ops.length > 0
            ? getTilesetLimitHint(model.layout, painting)
            : null,
    ].filter((hint): hint is string => hint !== null);
    setHint(hints.length > 0 ? hints.join(". ") : null);
};
