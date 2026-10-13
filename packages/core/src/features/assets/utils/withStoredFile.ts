import { db, filesTable } from "@standin/database";
import type { Transaction } from "@standin/database";
import { discardImage, storeImage } from "../library/utils/storeImage";
import type { UploadedImage } from "../types";

const DEFAULT_ORIGINAL_NAME = "image.png";

/**
 * Writes the PNG through the storage provider, opens the transaction, inserts
 * the `files` row and runs `run` with its id. When the transaction fails the
 * stored object is removed.
 */
export const withStoredFile = async <T>(
    image: UploadedImage,
    run: (tx: Transaction, fileId: string) => Promise<T>
): Promise<T> => {
    const stored = await storeImage(
        image.buffer,
        image.originalName ?? DEFAULT_ORIGINAL_NAME
    );

    try {
        return await db.transaction(async (tx) => {
            await tx.insert(filesTable).values({
                id: stored.id,
                originalName: stored.originalName,
                fileName: stored.storageKey,
                extension: ".png",
                mimeType: stored.mimeType,
                sizeInBytes: stored.sizeInBytes,
            });
            return run(tx, stored.id);
        });
    } catch (error) {
        await discardImage(stored.storageKey);
        throw error;
    }
};
