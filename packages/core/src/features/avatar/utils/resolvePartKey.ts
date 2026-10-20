import { avatarPartsTable, db, and, eq, isNull, like } from "@standin/database";
import { AvatarPartKeyTakenError } from "@standin/contracts";
import type { AvatarSlot } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { pickFreeKey, slugifyKey } from "../../assets/utils/deriveKey";
import { AVATAR_PART_KEY_FALLBACK } from "../consts/storage";

/**
 * The key of a new part: the one sent (409 when an active part has it), or the
 * slug of the slot and the name with `-2`, `-3` on a collision.
 */
export const resolvePartKey = async (
    sent: string | undefined,
    name: string,
    slot: AvatarSlot,
    executor: DbExecutor = db
): Promise<string> => {
    if (sent !== undefined) {
        const [taken] = await executor
            .select({ id: avatarPartsTable.id })
            .from(avatarPartsTable)
            .where(
                and(
                    eq(avatarPartsTable.key, sent),
                    isNull(avatarPartsTable.deletedAt)
                )
            );
        if (taken) throw new AvatarPartKeyTakenError();
        return sent;
    }

    const slotWords = slot.toLowerCase().replace(/_/g, " ");
    const base = slugifyKey(`${slotWords} ${name}`, AVATAR_PART_KEY_FALLBACK);
    const rows = await executor
        .select({ key: avatarPartsTable.key })
        .from(avatarPartsTable)
        .where(
            and(
                like(avatarPartsTable.key, `${base}%`),
                isNull(avatarPartsTable.deletedAt)
            )
        );
    return pickFreeKey(base, new Set(rows.map(({ key }) => key)));
};
