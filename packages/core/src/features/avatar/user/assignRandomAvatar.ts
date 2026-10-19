import { AVATAR_SLOT_TABS, randomAvatarConfig } from "@standin/contracts";
import type { AvatarRandomCatalog } from "@standin/contracts";
import { avatarPartsTable, db, isNull } from "@standin/database";
import { setUserAvatar } from "./setUserAvatar";

/**
 * What a random avatar draws from: the active parts of each slot, grouped in
 * families (a base part with its color variations). A family whose base part is
 * deleted is skipped. The base is null so the new user follows the default one.
 */
export const loadRandomCatalog = async (): Promise<AvatarRandomCatalog> => {
    const rows = await db
        .select({
            id: avatarPartsTable.id,
            slot: avatarPartsTable.slot,
            basePartId: avatarPartsTable.basePartId,
        })
        .from(avatarPartsTable)
        .where(isNull(avatarPartsTable.deletedAt));

    const familyIds = new Set(
        rows.filter(({ basePartId }) => basePartId === null).map(({ id }) => id)
    );
    const variations = new Map<string, string[]>();
    for (const row of rows) {
        const familyId = row.basePartId ?? row.id;
        if (!familyIds.has(familyId)) continue;
        variations.set(familyId, [...(variations.get(familyId) ?? []), row.id]);
    }

    return {
        baseId: null,
        slots: AVATAR_SLOT_TABS.map((slot) => ({
            slot,
            families: rows
                .filter((row) => row.slot === slot && row.basePartId === null)
                .map((row) => ({ variationIds: variations.get(row.id) ?? [] })),
        })),
    };
};

/**
 * Gives a new user a random avatar from the catalog. An empty catalog gives an
 * empty config, so the user keeps the default base (or the ghost when there is
 * none). It never throws: a failure to assemble is logged and must not stop the
 * sign up. Returns whether the user got parts.
 */
export const assignRandomAvatar = async (
    userId: string,
    rng: () => number = Math.random
): Promise<boolean> => {
    try {
        const config = randomAvatarConfig(await loadRandomCatalog(), rng);
        if (config.parts.length === 0) return false;
        await setUserAvatar(userId, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
