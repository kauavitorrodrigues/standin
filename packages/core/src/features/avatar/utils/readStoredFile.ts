import { StorageProvider } from "@standin/infra";

/** Reads a whole stored object into memory. Sheets are small. */
export const readStoredFile = async (storageKey: string): Promise<Buffer> => {
    const chunks: Buffer[] = [];
    for await (const chunk of await StorageProvider.download(storageKey)) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
};
