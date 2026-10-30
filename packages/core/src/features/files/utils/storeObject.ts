import { v7 as uuidv7 } from "uuid";
import { StorageProvider } from "@standin/infra";
import type { StoredObject, StoreObjectInput } from "../types";
import { buildStorageKey } from "./buildStorageKey";

/**
 * Writes bytes to storage under a name the server picks (uuid plus extension),
 * so the name a client sent never reaches the key. The `files` row is inserted
 * later, in the transaction of the caller, so a failed write leaves only this
 * object to clean up (see `discardObject`).
 */
export const storeObject = async ({
    buffer,
    folder,
    extension,
    mimeType,
}: StoreObjectInput): Promise<StoredObject> => {
    const id = uuidv7();
    const storageKey = buildStorageKey(folder, id, `${id}${extension}`);

    await StorageProvider.upload(buffer, storageKey, mimeType);
    return { id, storageKey, sizeInBytes: buffer.length };
};

/** Best effort: a file that cannot be removed is not worth hiding the cause. */
export const discardObject = async (storageKey: string): Promise<void> => {
    try {
        await StorageProvider.delete(storageKey);
    } catch (error) {
        console.error(error);
    }
};
