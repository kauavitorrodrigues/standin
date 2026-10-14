import type { AreaComposerFormValues } from "../types/areaComposerForm";

// The label of the zone the area creates when placed: the one typed, or the
// name when it was left empty. Null when the area creates no zone.
export const getZoneLabel = ({
    name,
    createZone,
    zoneLabel,
}: AreaComposerFormValues): string | null => {
    if (!createZone) return null;
    return zoneLabel.trim() || name.trim();
};
