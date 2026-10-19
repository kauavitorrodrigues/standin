import { and, avatarBasesTable, db, eq, isNull, like } from "@standin/database";
import { AvatarBaseKeyTakenError } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";
import { pickFreeKey, slugifyKey } from "../../../assets/utils/deriveKey";
import { AVATAR_BASE_KEY_FALLBACK } from "../../consts/folders";

/**
 * The key of a new base: the one sent (409 when an active base has it), or the
 * slug of the name with `-2`, `-3` on a collision.
 */
export const resolveBaseKey = async (
    sent: string | undefined,
    name: string,
    executor: DbExecutor = db
): Promise<string> => {
    if (sent !== undefined) {
        const [taken] = await executor
            .select({ id: avatarBasesTable.id })
            .from(avatarBasesTable)
            .where(
                and(
                    eq(avatarBasesTable.key, sent),
                    isNull(avatarBasesTable.deletedAt)
                )
            );
        if (taken) throw new AvatarBaseKeyTakenError();
        return sent;
    }

    const base = slugifyKey(name, AVATAR_BASE_KEY_FALLBACK);
    const rows = await executor
        .select({ key: avatarBasesTable.key })
        .from(avatarBasesTable)
        .where(
            and(
                like(avatarBasesTable.key, `${base}%`),
                isNull(avatarBasesTable.deletedAt)
            )
        );
    return pickFreeKey(base, new Set(rows.map(({ key }) => key)));
};
