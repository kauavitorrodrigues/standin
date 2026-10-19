import { avatarBasesTable, db, eq } from "@standin/database";
import { AvatarBaseNotFoundError } from "@standin/contracts";
import type { AvatarBase } from "@standin/contracts";
import { avatarBaseSelect } from "../consts/select";
import { toAvatarBase } from "./toAvatarBase";

/** The base as the admin page sees it, deleted or not. */
export const loadAvatarBase = async (baseId: string): Promise<AvatarBase> => {
    const [row] = await db
        .select(avatarBaseSelect)
        .from(avatarBasesTable)
        .where(eq(avatarBasesTable.id, baseId));
    if (!row) throw new AvatarBaseNotFoundError();
    return toAvatarBase(row);
};
