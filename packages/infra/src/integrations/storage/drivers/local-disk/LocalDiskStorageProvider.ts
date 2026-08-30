import fs from "node:fs/promises";
import path from "node:path";
import { FileUploadError, FileDeleteError } from "@standin/contracts";
import type { StorageProvider } from "../../types";
import { LOCAL_STORAGE_DIR } from "../../consts/storage";

export class LocalDiskStorageProvider implements StorageProvider {
    constructor(
        private basePath: string,
        private baseUrl: string
    ) {}

    async upload(file: Buffer, fileName: string) {
        try {
            await fs.mkdir(this.basePath, { recursive: true });
            await fs.writeFile(path.join(this.basePath, fileName), file);
            return { fileName };
        } catch (error) {
            throw new FileUploadError();
        }
    }

    async getUrl(fileName: string) {
        return `${this.baseUrl}/${LOCAL_STORAGE_DIR}/${fileName}`;
    }

    async delete(fileName: string) {
        try {
            await fs.unlink(path.join(this.basePath, fileName));
        } catch (error) {
            throw new FileDeleteError();
        }
    }
}
