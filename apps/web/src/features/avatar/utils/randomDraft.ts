import type {
    AvatarConfigPart,
    AvatarRandomCatalog,
    AvatarSlot,
} from "@standin/contracts";
import type { DraftPartsBySlot } from "../types/draft";
import type { AvatarCategoryPartItem } from "../types/editor";
import { createEmptyParts, toDraftChoice } from "./draft";

export type RandomPool = {
    slot: AvatarSlot;
    items: readonly AvatarCategoryPartItem[];
};

// What `randomAvatarConfig` draws from: every part of each category, in
// the order of the editor.
export const buildRandomCatalog = (
    pools: readonly RandomPool[],
    baseId: string | null
): AvatarRandomCatalog => ({
    baseId,
    slots: pools.map((pool) => ({
        slot: pool.slot,
        families: pool.items.map((item) => ({
            variationIds: item.variations.map((variation) => variation.id),
        })),
    })),
});

// Turns the random config into the parts of the draft, with the sheets the
// preview needs. A part the draft already has keeps its choice, so one that
// is no longer in the list (a deleted part) is not lost. Any other part that
// is not in the pools is skipped.
export const buildRandomParts = (
    parts: readonly AvatarConfigPart[],
    pools: readonly RandomPool[],
    current: DraftPartsBySlot = createEmptyParts()
): DraftPartsBySlot => {
    const next = createEmptyParts();

    for (const part of parts) {
        const kept = current[part.slot];
        if (kept?.partId === part.partId) {
            next[part.slot] = kept;
            continue;
        }
        const pool = pools.find((entry) => entry.slot === part.slot);
        for (const item of pool?.items ?? []) {
            const variation = item.variations.find(
                (entry) => entry.id === part.partId
            );
            if (variation) next[part.slot] = toDraftChoice(item, variation);
        }
    }

    return next;
};
