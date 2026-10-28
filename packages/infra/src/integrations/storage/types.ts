import type { Readable } from "node:stream";

export interface StorageProvider {
    // `contentType` is stored with the object by drivers that serve it
    // directly (S3), so a browser fetching the public URL renders it.
    upload(
        file: Buffer,
        fileName: string,
        contentType?: string
    ): Promise<{ fileName: string }>;
    getUrl(fileName: string): Promise<string>;
    download(fileName: string): Promise<Readable>;
    // Idempotent: deleting a file that is not there resolves.
    delete(fileName: string): Promise<void>;
}
