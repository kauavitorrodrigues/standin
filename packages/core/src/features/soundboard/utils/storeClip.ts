import {
    SOUNDBOARD_OUTPUT_EXTENSION,
    SOUNDBOARD_OUTPUT_MIME_TYPE,
    SOUNDBOARD_STORAGE_FOLDER,
} from "@standin/contracts";
import { storeObject } from "../../files/utils/storeObject";
import type { StoredClip } from "../types";

/** Writes the mp3 under the soundboard folder, with a name the server picks. */
export const storeClip = (buffer: Buffer): Promise<StoredClip> =>
    storeObject({
        buffer,
        folder: SOUNDBOARD_STORAGE_FOLDER,
        extension: SOUNDBOARD_OUTPUT_EXTENSION,
        mimeType: SOUNDBOARD_OUTPUT_MIME_TYPE,
    });
