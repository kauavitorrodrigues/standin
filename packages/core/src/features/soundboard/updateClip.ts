import { db, soundboardClipsTable, eq } from "@standin/database";
import {
    SoundboardClipForbiddenError,
    SoundboardClipNameTakenError,
    SoundboardClipNameSchema,
    SoundboardNameInvalidError,
} from "@standin/contracts";
import type { SoundboardClip } from "@standin/contracts";
import { isUniqueViolation } from "../../lib/isUniqueViolation";
import type { ClipChanges, ClipFields, SoundboardViewer } from "./types";
import { canManageClip } from "./utils/canManageClip";
import { findVisibleClip } from "./utils/findClip";
import { parseIcon, parseVolume } from "./utils/parseClipSettings";
import { toSoundboardClip } from "./utils/toSoundboardClip";

// Only the keys the caller sent are validated and changed. An icon of null
// or "" clears it.
const parseChanges = (fields: Partial<ClipFields>): ClipChanges => {
    const changes: ClipChanges = {};
    if (fields.name !== undefined) {
        const name = SoundboardClipNameSchema.safeParse(fields.name);
        if (!name.success) throw new SoundboardNameInvalidError();
        changes.name = name.data;
    }
    if (fields.icon !== undefined) changes.icon = parseIcon(fields.icon);
    if (fields.volume !== undefined)
        changes.volume = parseVolume(fields.volume);
    return changes;
};

/**
 * Changes the name, the icon or the volume of a clip. The owner of the
 * organization and the uploader may. The audio itself never changes: to change
 * it, upload again.
 */
export const updateClip = async (
    id: string,
    organizationId: string | null,
    fields: Partial<ClipFields>,
    viewer: SoundboardViewer
): Promise<SoundboardClip> => {
    const clip = await findVisibleClip(id, organizationId);
    if (!canManageClip(clip, viewer)) throw new SoundboardClipForbiddenError();

    const changes = parseChanges(fields);
    if (Object.keys(changes).length === 0) {
        throw new SoundboardNameInvalidError();
    }

    try {
        await db
            .update(soundboardClipsTable)
            .set(changes)
            .where(eq(soundboardClipsTable.id, id));
    } catch (error) {
        if (isUniqueViolation(error)) throw new SoundboardClipNameTakenError();
        throw error;
    }
    return toSoundboardClip(await findVisibleClip(id, organizationId), viewer);
};
