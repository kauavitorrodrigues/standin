import type { EditorModel } from "@standin/contracts";
import { createObjectSelectionProvider } from "@/features/editor/lib/createObjectSelectionProvider";
import type { SelectionProvider } from "@/features/editor/types/SelectionProvider";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// The object provider of the editor, without the objects that are locked: they
// are left out of the hit test, so a click goes through them to what is under.
export const createUnlockedObjectProvider = (
    env: ToolEnv,
    isLocked: (model: Readonly<EditorModel>, id: string) => boolean
): SelectionProvider => {
    const objects = createObjectSelectionProvider(env);

    return {
        hitTest: ({ model, worldX, worldY }) =>
            objects.hitTest({
                model: {
                    ...model,
                    placed: model.placed.filter(
                        ({ id }) => !isLocked(model, id)
                    ),
                },
                worldX,
                worldY,
            }),
    };
};
