import type { SelectionProviderFactory } from "@/features/editor/types/SelectionProvider";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { hitTestZones } from "@/features/editor/utils/hitTestZones";

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
