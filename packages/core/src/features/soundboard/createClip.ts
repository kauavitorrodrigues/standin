import { db, filesTable, soundboardClipsTable } from "@standin/database";
import {
    SOUNDBOARD_OUTPUT_EXTENSION,
    SOUNDBOARD_OUTPUT_MIME_TYPE,
    SoundboardClipForbiddenError,
    SoundboardClipNameTakenError,
} from "@standin/contracts";
import type { SoundboardClip } from "@standin/contracts";
import { isUniqueViolation } from "../../lib/isUniqueViolation";
import type { ClipFields, SoundboardUpload, SoundboardViewer } from "./types";
import { parseIcon, parseVolume } from "./utils/parseClipSettings";
import { findVisibleClip } from "./utils/findClip";
import { discardObject } from "../files/utils/storeObject";
import { storeClip } from "./utils/storeClip";
import { toSoundboardClip } from "./utils/toSoundboardClip";
import { validateClipUpload } from "./utils/validateClipUpload";

/**
 * Stores a trimmed clip. Any member adds to the library of the organization;
 * a default clip (no organization) is the platform admin's. The duration is
 * measured here from the mp3 frames, never taken from the client.
 */
export const createClip = async (
    organizationId: string | null,
    upload: SoundboardUpload | undefined,
    fields: ClipFields,
    viewer: SoundboardViewer
): Promise<SoundboardClip> => {
    if (organizationId === null && !viewer.isPlatformAdmin) {
        throw new SoundboardClipForbiddenError();
    }

    const valid = validateClipUpload(upload, fields.name);
    const icon = parseIcon(fields.icon);
    const volume = parseVolume(fields.volume);
    const stored = await storeClip(upload!.buffer);

    let id: string;
    try {
        id = await db.transaction(async (tx) => {
            await tx.insert(filesTable).values({
                id: stored.id,
                originalName: upload!.originalName,
                fileName: stored.storageKey,
                extension: SOUNDBOARD_OUTPUT_EXTENSION,
                mimeType: SOUNDBOARD_OUTPUT_MIME_TYPE,
                sizeInBytes: stored.sizeInBytes,
            });
            const [created] = await tx
                .insert(soundboardClipsTable)
                .values({
                    organizationId,
                    fileId: stored.id,
                    name: valid.name,
                    icon,
                    volume,
                    durationMs: valid.durationMs,
                    createdById: viewer.userId,
                })
                .returning({ id: soundboardClipsTable.id });
            return created!.id;
        });
    } catch (error) {
        await discardObject(stored.storageKey);
        if (isUniqueViolation(error)) throw new SoundboardClipNameTakenError();
        throw error;
    }

    // Read after the commit: a failure here must not remove the stored file of
    // a clip that exists.
    return toSoundboardClip(await findVisibleClip(id, organizationId), viewer);
};
