import type { HoverTarget } from "@/features/game/types/hover";
import { isWithinReach } from "@/features/game/utils/isWithinReach";

/**
 * The ids of the website objects the point is within reach of, sorted so two
 * answers about the same objects are the same list.
 */
export const findWebsitesInReach = (
    areas: readonly HoverTarget[],
    point: { x: number; y: number },
    reach: number
): string[] =>
    areas
        .filter((area) => isWithinReach(area.bounds, point, reach))
        .map((area) => area.id)
        .sort();
