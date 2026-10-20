import { avatarPartsTable, db, and, isNull, like } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import { pickFreeKey, slugifyKey } from "../../assets/utils/deriveKey";
import { AVATAR_VARIATION_KEY_FALLBACK } from "../consts/storage";

/**
 * The key of a new variation: the key of the base and the slug of the color
 * name, with `-2`, `-3` on a collision.
 */
export const resolveVariationKey = async (
    baseKey: string,
    colorKey: string,
    executor: DbExecutor = db
): Promise<string> => {
    const slug = slugifyKey(colorKey, AVATAR_VARIATION_KEY_FALLBACK);
    const candidate = `${baseKey}-${slug}`;
    const rows = await executor
        .select({ key: avatarPartsTable.key })
        .from(avatarPartsTable)
        .where(
            and(
                like(avatarPartsTable.key, `${candidate}%`),
                isNull(avatarPartsTable.deletedAt)
            )
        );
    return pickFreeKey(candidate, new Set(rows.map(({ key }) => key)));
};
