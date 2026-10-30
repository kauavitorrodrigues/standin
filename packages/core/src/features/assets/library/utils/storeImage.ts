import { discardObject, storeObject } from "../../../files/utils/storeObject";
import {
    LIBRARY_IMAGE_EXTENSION,
    LIBRARY_IMAGE_MIME_TYPE,
    LIBRARY_STORAGE_FOLDER,
} from "../consts/storage";

export type StoredImage = {
    id: string;
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeInBytes: number;
};

/**
 * Writes the PNG to storage. The name the client sent only goes to
 * `files.original_name`. The `files` row is inserted later, inside the
 * transaction (see `discardImage` for the cleanup).
 */
export const storeImage = async (
    buffer: Buffer,
    originalName: string
): Promise<StoredImage> => {
    const stored = await storeObject({
        buffer,
        folder: LIBRARY_STORAGE_FOLDER,
        extension: LIBRARY_IMAGE_EXTENSION,
        mimeType: LIBRARY_IMAGE_MIME_TYPE,
    });
    return { ...stored, originalName, mimeType: LIBRARY_IMAGE_MIME_TYPE };
};

export const discardImage = discardObject;
