import { v7 as uuidv7 } from "uuid";
import { StorageProvider } from "@standin/infra";
import { buildStorageKey } from "../../../files/utils/buildStorageKey";
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
 * Writes the PNG to storage under a name the server picks (uuid plus
 * extension). The name the client sent only goes to `files.original_name`.
 * The `files` row is inserted later, inside the transaction, so a failed
 * write leaves only this file to clean up (see `discardImage`).
 */
export const storeImage = async (
    buffer: Buffer,
    originalName: string
): Promise<StoredImage> => {
    const id = uuidv7();
    const storageKey = buildStorageKey(
        LIBRARY_STORAGE_FOLDER,
        id,
        `${id}${LIBRARY_IMAGE_EXTENSION}`
    );

    await StorageProvider.upload(buffer, storageKey, LIBRARY_IMAGE_MIME_TYPE);

    return {
        id,
        storageKey,
        originalName,
        mimeType: LIBRARY_IMAGE_MIME_TYPE,
        sizeInBytes: buffer.length,
    };
};

/** Best effort: a file that cannot be removed is not worth hiding the cause. */
export const discardImage = async (storageKey: string): Promise<void> => {
    try {
        await StorageProvider.delete(storageKey);
    } catch (error) {
        console.error(error);
    }
};
