import type { Readable } from "node:stream";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    type S3Client,
} from "@aws-sdk/client-s3";
import {
    FileDeleteError,
    FileDownloadError,
    FileNotFoundError,
    FileUploadError,
} from "@standin/contracts";
import type { StorageProvider } from "../../types";
import { OBJECT_CACHE_CONTROL } from "../../consts/storage";
import type { S3CompatibleConfig } from "./types";
import { createS3Client } from "./utils/createS3Client";
import { encodeObjectKey } from "./utils/encodeObjectKey";
import { isObjectNotFound } from "./utils/isObjectNotFound";

export class S3CompatibleStorageProvider implements StorageProvider {
    private client: S3Client;
    private publicUrl: string;

    constructor(private config: S3CompatibleConfig) {
        this.publicUrl = config.publicUrl.replace(/\/+$/, "");
        this.client = createS3Client(config);
    }

    async upload(
        file: Buffer,
        fileName: string,
        contentType?: string
    ): Promise<{ fileName: string }> {
        try {
            await this.client.send(
                new PutObjectCommand({
                    Bucket: this.config.bucket,
                    Key: fileName,
                    Body: file,
                    ContentType: contentType,
                    CacheControl: OBJECT_CACHE_CONTROL,
                })
            );
            return { fileName };
        } catch (error) {
            console.error(error);
            throw new FileUploadError();
        }
    }

    async getUrl(fileName: string): Promise<string> {
        return `${this.publicUrl}/${encodeObjectKey(fileName)}`;
    }

    async download(fileName: string): Promise<Readable> {
        try {
            const response = await this.client.send(
                new GetObjectCommand({
                    Bucket: this.config.bucket,
                    Key: fileName,
                })
            );
            if (!response.Body) throw new FileDownloadError();

            // In Node the SDK's body is a readable stream.
            return response.Body as Readable;
        } catch (error) {
            if (isObjectNotFound(error)) {
                throw new FileNotFoundError();
            }
            if (error instanceof FileDownloadError) throw error;
            console.error(error);
            throw new FileDownloadError();
        }
    }

    async delete(fileName: string): Promise<void> {
        try {
            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: this.config.bucket,
                    Key: fileName,
                })
            );
        } catch (error) {
            console.error(error);
            throw new FileDeleteError();
        }
    }
}
