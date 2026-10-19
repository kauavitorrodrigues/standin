import { AVATAR_BASE_KINDS, AvatarBaseInvalidError } from "@standin/contracts";
import type { avatarBasesTable } from "@standin/database";

export type AvatarBaseRow = Pick<
    typeof avatarBasesTable.$inferSelect,
    "id" | "deletedAt" | "kind"
>;

/**
 * Checks the base a config names. It must exist, be a body (a mannequin is
 * never anyone's base) and be active, except for a deleted base the person
 * already uses, which stays valid. Anything wrong is `AvatarBaseInvalidError`.
 */
export const validateAvatarBase = (
    base: AvatarBaseRow | undefined,
    ownedBaseId: string | null
): AvatarBaseRow => {
    if (!base) throw new AvatarBaseInvalidError();
    if (base.kind !== AVATAR_BASE_KINDS.BODY)
        throw new AvatarBaseInvalidError();
    if (base.deletedAt !== null && base.id !== ownedBaseId) {
        throw new AvatarBaseInvalidError();
    }
    return base;
};
