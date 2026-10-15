import { StorageProvider } from "@standin/infra";

/**
 * Whether the stored object is byte for byte the buffer. There is no
 * checksum column, so the object is read back: it is what lets an import
 * sent twice leave the image unchanged.
 */
export const isSameStoredFile = async (
    storageKey: string,
    buffer: Buffer
): Promise<boolean> => {
    try {
        const chunks: Buffer[] = [];
        for await (const chunk of await StorageProvider.download(storageKey)) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks).equals(buffer);
    } catch {
        return false;
    }
};
