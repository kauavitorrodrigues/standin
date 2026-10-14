import { createSceneObjectSurface } from "@/features/maps/__shared__/utils/createSceneObjectSurface";
import { hitTestObjects } from "@/features/maps/__shared__/utils/hitTestObjects";
import type { SelectionProviderFactory } from "@/features/maps/__shared__/types/SelectionProvider";

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
