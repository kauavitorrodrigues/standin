import { v7 as uuidv7 } from "uuid";
import { db, filesTable } from "@standin/database";
import type { Transaction } from "@standin/database";
import { StorageProvider } from "@standin/infra";
import { discardImage } from "../../assets/library/utils/storeImage";
import { buildStorageKey } from "../../files/utils/buildStorageKey";
import {
    AVATAR_IMAGE_EXTENSION,
    AVATAR_IMAGE_MIME_TYPE,
} from "../consts/storage";

export type SheetUpload = {
    buffer: Buffer;
    originalName: string;
};

/**
 * Writes the PNGs through the storage provider under `folder`, opens a
 * transaction, inserts one `files` row for each and runs `run` with their ids,
 * in the same order. When anything fails the stored objects are removed, so a
 * failed save leaves nothing behind.
 */
export const withStoredSheets = async <T>(
    uploads: readonly SheetUpload[],
    folder: string,
    run: (tx: Transaction, fileIds: string[]) => Promise<T>
): Promise<T> => {
    const stored: { id: string; storageKey: string; upload: SheetUpload }[] =
        [];

    try {
        for (const upload of uploads) {
            const id = uuidv7();
            const storageKey = buildStorageKey(
                folder,
                id,
                `${id}${AVATAR_IMAGE_EXTENSION}`
            );
            await StorageProvider.upload(
                upload.buffer,
                storageKey,
                AVATAR_IMAGE_MIME_TYPE
            );
            stored.push({ id, storageKey, upload });
        }

        return await db.transaction(async (tx) => {
            for (const { id, storageKey, upload } of stored) {
                await tx.insert(filesTable).values({
                    id,
                    originalName: upload.originalName,
                    fileName: storageKey,
                    extension: AVATAR_IMAGE_EXTENSION,
                    mimeType: AVATAR_IMAGE_MIME_TYPE,
                    sizeInBytes: upload.buffer.length,
                });
            }
            return run(
                tx,
                stored.map(({ id }) => id)
            );
        });
    } catch (error) {
        for (const { storageKey } of stored) await discardImage(storageKey);
        throw error;
    }
};
