import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import type { Readable } from "node:stream";
import {
    FileUploadError,
    FileDeleteError,
    FileNotFoundError,
} from "@standin/contracts";
import type { StorageProvider } from "../../types";
import { LOCAL_STORAGE_DIR } from "../../consts/storage";

export class LocalDiskStorageProvider implements StorageProvider {
    constructor(
        private basePath: string,
        private baseUrl: string
    ) {}

    async upload(file: Buffer, fileName: string) {
        try {
            const filePath = path.join(this.basePath, fileName);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, file);
            return { fileName };
        } catch (error) {
            throw new FileUploadError();
        }
    }

    async getUrl(fileName: string) {
        return `${this.baseUrl}/${LOCAL_STORAGE_DIR}/${fileName}`;
    }

    async download(fileName: string): Promise<Readable> {
        const filePath = path.join(this.basePath, fileName);

        try {
            await fs.access(filePath);
        } catch (error) {
            throw new FileNotFoundError();
        }

        return createReadStream(filePath);
    }

    async delete(fileName: string) {
        try {
            await fs.unlink(path.join(this.basePath, fileName));
        } catch (error) {
            throw new FileDeleteError();
        }
    }
}
