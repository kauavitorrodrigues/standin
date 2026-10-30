import {
    SOUNDBOARD_OUTPUT_EXTENSION,
    SOUNDBOARD_OUTPUT_MIME_TYPE,
    SOUNDBOARD_UPLOAD_FIELDS,
} from "@standin/contracts";
import type { ClipUploadFields } from "../types/upload";
import { clampVolume } from "./clampVolume";

/**
 * The multipart body of an upload. The icon is left out when the clip has
 * none, and the volume goes as a plain decimal string, which is what the
 * server parses.
 */
export const buildClipFormData = (
    bytes: Uint8Array<ArrayBuffer>,
    { name, icon, volume }: ClipUploadFields
): FormData => {
    const body = new FormData();
    body.append(
        SOUNDBOARD_UPLOAD_FIELDS.file,
        new Blob([bytes], { type: SOUNDBOARD_OUTPUT_MIME_TYPE }),
        `clip${SOUNDBOARD_OUTPUT_EXTENSION}`
    );
    body.append(SOUNDBOARD_UPLOAD_FIELDS.name, name);
    if (icon) body.append(SOUNDBOARD_UPLOAD_FIELDS.icon, icon);
    body.append(SOUNDBOARD_UPLOAD_FIELDS.volume, String(clampVolume(volume)));
    return body;
};
