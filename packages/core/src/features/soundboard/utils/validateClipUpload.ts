import {
    SOUNDBOARD_DURATION_TOLERANCE_MS,
    SOUNDBOARD_EXTENSIONS,
    SOUNDBOARD_MAX_CLIP_BYTES,
    SOUNDBOARD_MAX_DURATION_MS,
    SOUNDBOARD_MIME_TYPES,
    SOUNDBOARD_MIN_DURATION_MS,
    SoundboardClipNameSchema,
    SoundboardClipTooLongError,
    SoundboardClipTooShortError,
    SoundboardFileMissingError,
    SoundboardFileTooLargeError,
    SoundboardNameInvalidError,
    SoundboardUnsupportedFormatError,
} from "@standin/contracts";
import path from "node:path";
import type { SoundboardUpload, ValidClip } from "../types";
import { readMp3Info } from "./readMp3Info";

const hasAcceptedExtension = (originalName: string): boolean =>
    (SOUNDBOARD_EXTENSIONS as readonly string[]).includes(
        path.extname(originalName).toLowerCase()
    );

const hasAcceptedMimeType = (mimeType: string): boolean =>
    (SOUNDBOARD_MIME_TYPES as readonly string[]).includes(mimeType);

/**
 * Checks a clip upload with the same limits the editor shows, since the
 * client is never trusted: the name, the declared type, the size, and the
 * bytes themselves (the duration comes from the mp3 frames).
 */
export const validateClipUpload = (
    upload: SoundboardUpload | undefined,
    name: unknown
): ValidClip => {
    if (!upload) throw new SoundboardFileMissingError();

    const parsedName = SoundboardClipNameSchema.safeParse(name);
    if (!parsedName.success) throw new SoundboardNameInvalidError();

    if (upload.buffer.length > SOUNDBOARD_MAX_CLIP_BYTES) {
        throw new SoundboardFileTooLargeError();
    }
    if (
        !hasAcceptedMimeType(upload.mimeType) ||
        !hasAcceptedExtension(upload.originalName)
    ) {
        throw new SoundboardUnsupportedFormatError();
    }

    const info = readMp3Info(upload.buffer);
    if (!info) throw new SoundboardUnsupportedFormatError();

    if (info.durationMs < SOUNDBOARD_MIN_DURATION_MS) {
        throw new SoundboardClipTooShortError();
    }
    if (
        info.durationMs >
        SOUNDBOARD_MAX_DURATION_MS + SOUNDBOARD_DURATION_TOLERANCE_MS
    ) {
        throw new SoundboardClipTooLongError();
    }

    return { name: parsedName.data, durationMs: info.durationMs };
};
