import { AvatarPartInvalidError } from "@standin/contracts";
import type { AvatarConfig } from "@standin/contracts";
import type { avatarPartsTable } from "@standin/database";
import type { ChosenPart } from "../sheets/toSheetSources";

// The columns of a part row that the validation and the assembly need.
export type AvatarConfigPartRow = Pick<
    typeof avatarPartsTable.$inferSelect,
    "id" | "slot" | "fileId" | "deletedAt"
>;

/**
 * Checks the parts of a config against the rows it names and returns the
 * choices with the sheets to assemble. At most one entry per slot. Each part
 * must exist, belong to the slot and be active, except for a deleted part the
 * person already has, which stays valid. A color is a variation, which is a
 * part like any other, so it goes through the same checks. Anything wrong is
 * `AvatarPartInvalidError`.
 */
export const validateAvatarConfig = (
    config: AvatarConfig,
    parts: readonly AvatarConfigPartRow[],
    ownedPartIds: ReadonlySet<string>
): ChosenPart[] => {
    const byId = new Map(parts.map((part) => [part.id, part]));
    const slots = new Set<string>();

    return config.parts.map((entry) => {
        if (slots.has(entry.slot)) throw new AvatarPartInvalidError();
        slots.add(entry.slot);

        const part = byId.get(entry.partId);
        if (!part || part.slot !== entry.slot) {
            throw new AvatarPartInvalidError();
        }
        const deleted = part.deletedAt !== null;
        if (deleted && !ownedPartIds.has(part.id)) {
            throw new AvatarPartInvalidError();
        }

        return {
            slot: entry.slot,
            partId: part.id,
            fileId: part.fileId,
        };
    });
};
