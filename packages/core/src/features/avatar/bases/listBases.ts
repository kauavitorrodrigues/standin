import { asc, avatarBasesTable, db, desc, isNull } from "@standin/database";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBaseGroup, AvatarBaseList } from "@standin/contracts";
import { avatarBaseSelect } from "./consts/select";
import { toAvatarBase } from "./utils/toAvatarBase";

// The order of the groups: the bodies, then the mannequins.
const GROUP_ORDER = [AVATAR_BASE_KINDS.BODY, AVATAR_BASE_KINDS.MANNEQUIN];

/**
 * The active bases grouped by kind, both groups always there. Inside a group
 * the default comes first and the rest by name.
 */
export const listBases = async (): Promise<AvatarBaseList> => {
    const rows = await db
        .select(avatarBaseSelect)
        .from(avatarBasesTable)
        .where(isNull(avatarBasesTable.deletedAt))
        .orderBy(
            asc(avatarBasesTable.kind),
            desc(avatarBasesTable.isDefault),
            asc(avatarBasesTable.name)
        );
    const bases = rows.map(toAvatarBase);

    const groups: AvatarBaseGroup[] = GROUP_ORDER.map((kind) => ({
        kind,
        bases: bases.filter((base) => base.kind === kind),
    }));
    return { groups };
};
