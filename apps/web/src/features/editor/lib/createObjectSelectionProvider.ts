import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { hitTestObjects } from "@/features/editor/utils/hitTestObjects";
import type { SelectionProviderFactory } from "@/features/editor/types/SelectionProvider";

// Objects as selectable things: the placed object with the greatest depth
// under the point, by sprite box and pixel alpha.
export const createObjectSelectionProvider: SelectionProviderFactory = (
    env
) => {
    const surface = createSceneObjectSurface(env.scene);

    return {
        hitTest: ({ model, worldX, worldY }) =>
            hitTestObjects({ model, worldX, worldY, surface }),
    };
};
