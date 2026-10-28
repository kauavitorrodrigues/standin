import { afterEach, describe, expect, it, vi } from "vitest";
import {
    InvalidEnvironmentVariableError,
    MissingEnvironmentVariableError,
    UnknownStorageDriverError,
} from "@standin/contracts";

const { S3ClientMock } = vi.hoisted(() => ({ S3ClientMock: vi.fn() }));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@aws-sdk/client-s3")>()),
    S3Client: S3ClientMock,
}));

import { createStorageProvider } from "../factory";
import { LocalDiskStorageProvider } from "../drivers/local-disk/LocalDiskStorageProvider";
import { S3CompatibleStorageProvider } from "../drivers/s3-compatible/S3CompatibleStorageProvider";

const S3_ENV = {
    STORAGE_DRIVER: "s3",
    S3_ENDPOINT: "https://example.r2.cloudflarestorage.com",
    S3_BUCKET: "standin-files",
    S3_ACCESS_KEY_ID: "access-key",
    S3_SECRET_ACCESS_KEY: "secret-key",
    S3_PUBLIC_URL: "https://files.example.com",
};

afterEach(() => {
    S3ClientMock.mockClear();
    vi.unstubAllEnvs();
});

const stubEnv = (env: Record<string, string>) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
};

describe("createStorageProvider", () => {
    it("uses the local disk by default", () => {
        stubEnv({ STORAGE_DRIVER: "", SERVER_URL: "http://localhost:3001" });

        expect(createStorageProvider()).toBeInstanceOf(
            LocalDiskStorageProvider
        );
    });

    it("builds the S3 provider from the environment", () => {
        stubEnv(S3_ENV);

        expect(createStorageProvider()).toBeInstanceOf(
            S3CompatibleStorageProvider
        );
    });

    it("hands the trimmed config to the S3 client and defaults the region", () => {
        stubEnv({
            ...S3_ENV,
            S3_ENDPOINT: "  https://example.r2.cloudflarestorage.com  ",
        });

        createStorageProvider();

        expect(S3ClientMock).toHaveBeenCalledWith(
            expect.objectContaining({
                region: "auto",
                endpoint: "https://example.r2.cloudflarestorage.com",
                forcePathStyle: true,
                credentials: {
                    accessKeyId: "access-key",
                    secretAccessKey: "secret-key",
                },
            })
        );
    });

    it("uses the region when one is set", () => {
        stubEnv({ ...S3_ENV, S3_REGION: "us-east-1" });

        createStorageProvider();

        expect(S3ClientMock).toHaveBeenCalledWith(
            expect.objectContaining({ region: "us-east-1" })
        );
    });

    it("treats a whitespace-only value as missing", () => {
        stubEnv({ ...S3_ENV, S3_BUCKET: "   " });

        expect(() => createStorageProvider()).toThrow(
            MissingEnvironmentVariableError
        );
    });

    it.each([
        ["S3_PUBLIC_URL", "files.example.com"],
        ["S3_PUBLIC_URL", "ftp://files.example.com"],
        ["S3_ENDPOINT", "not a url"],
        [
            "S3_ENDPOINT",
            "https://example.r2.cloudflarestorage.com/standin-files",
        ],
    ])("rejects %s=%s", (name, value) => {
        stubEnv({ ...S3_ENV, [name]: value });

        expect(() => createStorageProvider()).toThrow(
            InvalidEnvironmentVariableError
        );
    });

    it.each([
        "S3_ENDPOINT",
        "S3_BUCKET",
        "S3_ACCESS_KEY_ID",
        "S3_SECRET_ACCESS_KEY",
        "S3_PUBLIC_URL",
    ])("fails at once when %s is missing", (name) => {
        stubEnv({ ...S3_ENV, [name]: "" });

        expect(() => createStorageProvider()).toThrow(
            MissingEnvironmentVariableError
        );
    });

    it("rejects an unknown driver", () => {
        stubEnv({ STORAGE_DRIVER: "ftp" });

        expect(() => createStorageProvider()).toThrow(
            UnknownStorageDriverError
        );
    });
});
