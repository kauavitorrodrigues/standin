import type {
    AvatarPart,
    AvatarPartRow as AvatarPartRowResult,
} from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import type { AvatarPartRow } from "../types";

/** One row of the library, a base part or a color variation. */
export const toAvatarPartRow = (row: AvatarPartRow): AvatarPartRowResult => ({
    id: row.id,
    key: row.key,
    name: row.name,
    slot: row.slot,
    basePartId: row.basePartId,
    colorKey: row.colorKey,
    colorHex: row.colorHex,
    url: buildFileUrl(row.fileId),
    previewUrl: buildFileUrl(row.previewFileId),
    createdAt: row.createdAt.toISOString(),
});

/**
 * A family as the admin page sees it: the base row and, in `variations`, every
 * row of the family given, the base first and the others by creation date.
 */
export const toAvatarPart = (
    base: AvatarPartRow,
    variations: readonly AvatarPartRow[]
): AvatarPart => {
    const ordered = [...variations].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const rows = [base, ...ordered.filter((row) => row.id !== base.id)];
    return { ...toAvatarPartRow(base), variations: rows.map(toAvatarPartRow) };
};
