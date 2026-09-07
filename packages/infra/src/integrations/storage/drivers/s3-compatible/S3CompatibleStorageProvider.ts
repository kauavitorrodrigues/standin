import type { Readable } from "node:stream";
import { StorageDriverNotImplementedError } from "@standin/contracts";
import type { StorageProvider } from "../../types";

type S3CompatibleConfig = {
    endpoint: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
};

export class S3CompatibleStorageProvider implements StorageProvider {
    constructor(private config: S3CompatibleConfig) {}

    async upload(
        _file: Buffer,
        _fileName: string
    ): Promise<{ fileName: string }> {
        throw new StorageDriverNotImplementedError();
    }

    async getUrl(_fileName: string): Promise<string> {
        throw new StorageDriverNotImplementedError();
    }

    async download(_fileName: string): Promise<Readable> {
        throw new StorageDriverNotImplementedError();
    }

    async delete(_fileName: string): Promise<void> {
        throw new StorageDriverNotImplementedError();
    }
}
