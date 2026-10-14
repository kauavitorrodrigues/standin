import type { MapTemplate, SizeTier } from "@standin/contracts";

const NEARBY_DISTANCE = 1;

// The templates of the chosen size whose photo is worth having ready: the
// selected one and the ones next to it in the list, which are the next likely
// choices. With none selected (the blank map) it is the first of the size.
export const getNearbyTemplates = (
    templates: MapTemplate[],
    templateId: string | undefined,
    tier: SizeTier
): MapTemplate[] => {
    const ofTier = templates.filter((template) => template.sizeTier === tier);
    const selected = ofTier.findIndex((template) => template.id === templateId);
    const center = Math.max(selected, 0);

    return ofTier.filter(
        (_, index) => Math.abs(index - center) <= NEARBY_DISTANCE
    );
};
