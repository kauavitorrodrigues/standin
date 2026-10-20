import { AVATAR_RANDOM_CHANCE } from "../consts/limits";
import type {
    AvatarConfig,
    AvatarConfigPart,
} from "../schemas/avatar-config.schema";
import type { AvatarRandomCatalog } from "../types/random";

// Picks an index in a list of `length` items from a number in [0, 1).
const pickIndex = (rng: () => number, length: number) =>
    Math.min(length - 1, Math.floor(rng() * length));

// A random avatar from the catalog. For each slot, in the order of the
// catalog, it rolls the chance of the slot, then picks a part (a family) and
// one of its variations, which is how the color is chosen. A slot without
// parts is skipped, and an empty catalog gives a config with no parts. `rng`
// returns a number in [0, 1) and is injected so tests can fix it.
export const randomAvatarConfig = (
    catalog: AvatarRandomCatalog,
    rng: () => number
): AvatarConfig => {
    const parts: AvatarConfigPart[] = [];
    const seen = new Set<string>();

    for (const entry of catalog.slots) {
        const families = entry.families.filter(
            (family) => family.variationIds.length > 0
        );
        if (seen.has(entry.slot) || families.length === 0) continue;
        seen.add(entry.slot);

        if (rng() >= AVATAR_RANDOM_CHANCE[entry.slot]) continue;

        const family = families[pickIndex(rng, families.length)];
        const partId =
            family.variationIds[pickIndex(rng, family.variationIds.length)];

        parts.push({ slot: entry.slot, partId });
    }

    return { baseId: catalog.baseId, parts };
};
