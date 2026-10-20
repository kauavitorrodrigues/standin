import { and, avatarBasesTable, eq, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import type { AvatarBaseKind } from "@standin/contracts";

/**
 * Turns off the default flag of the active default base of a kind. It runs
 * before the new default is set, in the same transaction, because the unique
 * index allows only one active default per kind at a time. The other kind is
 * left alone.
 */
export const unsetDefaultBase = async (
    tx: Transaction,
    kind: AvatarBaseKind
): Promise<void> => {
    await tx
        .update(avatarBasesTable)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
            and(
                eq(avatarBasesTable.kind, kind),
                eq(avatarBasesTable.isDefault, true),
                isNull(avatarBasesTable.deletedAt)
            )
        );
};
