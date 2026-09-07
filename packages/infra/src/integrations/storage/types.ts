import type { Readable } from "node:stream";

export interface StorageProvider {
    upload(file: Buffer, fileName: string): Promise<{ fileName: string }>;
    getUrl(fileName: string): Promise<string>;
    download(fileName: string): Promise<Readable>;
    delete(fileName: string): Promise<void>;
}
