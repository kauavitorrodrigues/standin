import { beforeEach, describe, expect, it, vi } from "vitest";
import { Readable } from "node:stream";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
    FileDeleteError,
    FileDownloadError,
    FileNotFoundError,
    FileUploadError,
} from "@standin/contracts";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@aws-sdk/client-s3")>()),
    S3Client: vi.fn(function S3Client(this: { send: typeof send }) {
        this.send = send;
    }),
}));

import { S3CompatibleStorageProvider } from "../S3CompatibleStorageProvider";

const makeProvider = () =>
    new S3CompatibleStorageProvider({
        endpoint: "https://example.r2.cloudflarestorage.com",
        region: "auto",
        bucket: "standin-files",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
        publicUrl: "https://files.example.com/",
    });

beforeEach(() => {
    send.mockReset().mockResolvedValue({});
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("S3CompatibleStorageProvider", () => {
    it("uploads with the content type and an immutable cache policy", async () => {
        const buffer = Buffer.from("png");

        const result = await makeProvider().upload(
            buffer,
            "library/a.png",
            "image/png"
        );

        expect(result).toEqual({ fileName: "library/a.png" });
        const command = send.mock.calls[0][0];
        expect(command).toBeInstanceOf(PutObjectCommand);
        expect(command).toMatchObject({
            input: {
                Bucket: "standin-files",
                Key: "library/a.png",
                Body: buffer,
                ContentType: "image/png",
                CacheControl: "public, max-age=31536000, immutable",
            },
        });
    });

    it("uploads without a content type when none is given", async () => {
        await makeProvider().upload(Buffer.from("x"), "a.bin");

        expect(send.mock.calls[0][0].input.ContentType).toBeUndefined();
    });

    it("maps an upload failure to FileUploadError", async () => {
        send.mockRejectedValue(new Error("boom"));

        await expect(
            makeProvider().upload(Buffer.from("x"), "a.png")
        ).rejects.toBeInstanceOf(FileUploadError);
    });

    it("builds the public url without doubling slashes", async () => {
        expect(await makeProvider().getUrl("maps/1/a b.png")).toBe(
            "https://files.example.com/maps/1/a%20b.png"
        );
    });

    it("downloads the object body as a stream", async () => {
        const body = Readable.from(["data"]);
        send.mockResolvedValue({ Body: body });

        const stream = await makeProvider().download("a.png");

        expect(stream).toBe(body);
        expect(send.mock.calls[0][0]).toBeInstanceOf(GetObjectCommand);
        expect(send.mock.calls[0][0].input).toEqual({
            Bucket: "standin-files",
            Key: "a.png",
        });
    });

    it.each([
        ["NoSuchKey", {}],
        ["NotFound", {}],
        ["UnknownError", { $metadata: { httpStatusCode: 404 } }],
    ])("maps a missing key (%s) to FileNotFoundError", async (name, extra) => {
        send.mockRejectedValue(
            Object.assign(new Error("missing"), { name, ...extra })
        );

        await expect(makeProvider().download("a.png")).rejects.toBeInstanceOf(
            FileNotFoundError
        );
    });

    it("maps an empty body or other failure to FileDownloadError", async () => {
        send.mockResolvedValueOnce({});
        await expect(makeProvider().download("a.png")).rejects.toBeInstanceOf(
            FileDownloadError
        );

        send.mockRejectedValueOnce(new Error("boom"));
        await expect(makeProvider().download("a.png")).rejects.toBeInstanceOf(
            FileDownloadError
        );
    });

    it("deletes the object and maps a failure to FileDeleteError", async () => {
        await makeProvider().delete("a.png");
        expect(send.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand);
        expect(send.mock.calls[0][0].input).toEqual({
            Bucket: "standin-files",
            Key: "a.png",
        });

        send.mockRejectedValue(new Error("boom"));
        await expect(makeProvider().delete("a.png")).rejects.toBeInstanceOf(
            FileDeleteError
        );
    });
});
