import {
    AVATAR_RANDOM_ESSENTIAL_SLOTS,
    AVATAR_RANDOM_EXTRA_CHANCE,
} from "../consts/limits";
import { AVATAR_SLOTS } from "../enums/slots";
import type {
    AvatarConfig,
    AvatarConfigPart,
} from "../schemas/avatar-config.schema";
import type { AvatarRandomCatalog } from "../types/random";

// Picks an index in a list of `length` items from a number in [0, 1).
const pickIndex = (rng: () => number, length: number) =>
    Math.min(length - 1, Math.floor(rng() * length));

// A random avatar from the catalog. The essential slots are always drawn
// again. Any other slot keeps the part in `current` (or stays empty) and is
// drawn again only with `AVATAR_RANDOM_EXTRA_CHANCE`. A draw picks a part (a
// family) and one of its variations, which is how the color is chosen. The
// costume is never drawn and never kept. A slot without parts keeps its
// current part, and an empty catalog keeps the current parts of the other
// slots. `rng` returns a number in [0, 1) and is injected so tests can fix it.
export const randomAvatarConfig = (
    catalog: AvatarRandomCatalog,
    rng: () => number,
    current: readonly AvatarConfigPart[] = []
): AvatarConfig => {
    const kept = new Map<string, AvatarConfigPart>(
        current
            .filter((part) => part.slot !== AVATAR_SLOTS.COSTUME)
            .map((part) => [part.slot, part])
    );
    const parts: AvatarConfigPart[] = [];
    const seen = new Set<string>();

    for (const entry of catalog.slots) {
        if (seen.has(entry.slot) || entry.slot === AVATAR_SLOTS.COSTUME)
            continue;
        seen.add(entry.slot);

        const currentPart = kept.get(entry.slot);
        const families = entry.families.filter(
            (family) => family.variationIds.length > 0
        );
        if (families.length === 0) {
            if (currentPart) parts.push(currentPart);
            continue;
        }

        const isEssential = AVATAR_RANDOM_ESSENTIAL_SLOTS.includes(entry.slot);
        if (!isEssential && rng() >= AVATAR_RANDOM_EXTRA_CHANCE) {
            if (currentPart) parts.push(currentPart);
            continue;
        }

        const family = families[pickIndex(rng, families.length)];
        const partId =
            family.variationIds[pickIndex(rng, family.variationIds.length)];

        parts.push({ slot: entry.slot, partId });
    }

    // Slots the catalog does not list are left as they are.
    for (const part of kept.values()) {
        if (!seen.has(part.slot)) parts.push(part);
    }

    return { baseId: catalog.baseId, parts };
};
