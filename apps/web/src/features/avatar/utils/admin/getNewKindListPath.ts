import { AVATAR_ADMIN_PATHS, AVATAR_NEW_KINDS } from "../../consts/avatarNew";
import type { AvatarNewKind } from "../../consts/avatarNew";

// The list the person goes back to once a registration is done.
export const getNewKindListPath = (kind: AvatarNewKind) => {
    switch (kind) {
        case AVATAR_NEW_KINDS.PART:
        case AVATAR_NEW_KINDS.COLOR:
            return AVATAR_ADMIN_PATHS.PARTS;
        case AVATAR_NEW_KINDS.BASE:
        case AVATAR_NEW_KINDS.MANNEQUIN:
            return AVATAR_ADMIN_PATHS.BASES;
    }
};
