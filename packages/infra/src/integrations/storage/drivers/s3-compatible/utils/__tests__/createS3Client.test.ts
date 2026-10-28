import { describe, expect, it, vi } from "vitest";

const { S3ClientMock } = vi.hoisted(() => ({ S3ClientMock: vi.fn() }));

vi.mock("@aws-sdk/client-s3", () => ({ S3Client: S3ClientMock }));

import { createS3Client } from "../createS3Client";

describe("createS3Client", () => {
    it("uses path style and only sends checksums when required", () => {
        createS3Client({
            endpoint: "https://example.com",
            region: "auto",
            bucket: "b",
            accessKeyId: "id",
            secretAccessKey: "secret",
            publicUrl: "https://files.example.com",
        });

        expect(S3ClientMock).toHaveBeenCalledWith({
            region: "auto",
            endpoint: "https://example.com",
            forcePathStyle: true,
            requestChecksumCalculation: "WHEN_REQUIRED",
            responseChecksumValidation: "WHEN_REQUIRED",
            credentials: { accessKeyId: "id", secretAccessKey: "secret" },
        });
    });
});
