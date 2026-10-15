import type { AreaComposerFormValues } from "../types/areaComposerForm";

// The label of the zone the area creates when placed: the name of the area.
// Null when the area creates no zone.
export const getZoneLabel = ({
    name,
    createZone,
}: AreaComposerFormValues): string | null => {
    if (!createZone) return null;
    return name.trim();
};
