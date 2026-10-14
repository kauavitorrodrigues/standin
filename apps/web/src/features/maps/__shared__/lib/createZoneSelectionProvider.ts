import type { SelectionProviderFactory } from "@/features/maps/__shared__/types/SelectionProvider";
import { getLayoutZones } from "@/features/maps/__shared__/utils/getLayoutZones";
import { hitTestZones } from "@/features/maps/__shared__/utils/hitTestZones";

// Zones as selectable things. With the zones toggle off nothing answers, so
// the objects under an area are reachable again (see ZONE_SELECTION for how a
// zone and an object stacked on one point are resolved).
export const createZoneSelectionProvider: SelectionProviderFactory = (env) => ({
    hitTest: ({ model, worldX, worldY }) => {
        if (!env.store.getState().zonesVisible) return null;

        return hitTestZones({
            zones: getLayoutZones(model.layout),
            worldX,
            worldY,
        });
    },
});
