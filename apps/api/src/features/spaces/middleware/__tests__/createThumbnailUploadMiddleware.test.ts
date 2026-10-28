import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import type { Response } from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { UPLOAD_LIMITS } from "@standin/contracts";
import { handleUploadError } from "../../../files/middleware/handleUploadError";
import { uploadSpaceThumbnail } from "../createThumbnailUploadMiddleware";
import type { ExtendedRequest } from "@/types/request";

vi.spyOn(console, "error").mockImplementation(() => {});

describe("uploadSpaceThumbnail", () => {
    let server: http.Server;
    let baseUrl: string;

    beforeAll(async () => {
        const app = express();
        app.put(
            "/",
            uploadSpaceThumbnail,
            handleUploadError,
            (req: ExtendedRequest, res: Response) => {
                res.status(200).json({
                    size: req.file?.size ?? null,
                    mimetype: req.file?.mimetype ?? null,
                });
            }
        );
        server = http.createServer(app);
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server.close(resolve));
    });

    const send = async (field: string, bytes: number, type: string) => {
        const form = new FormData();
        form.append(
            field,
            new Blob([Buffer.alloc(bytes)], { type }),
            "photo.png"
        );
        const response = await fetch(baseUrl, { method: "PUT", body: form });
        return { status: response.status, body: await response.json() };
    };

    it("reads the image sent under the thumbnail field", async () => {
        const response = await send("thumbnail", 10, "image/png");

        expect(response).toEqual({
            status: 200,
            body: { size: 10, mimetype: "image/png" },
        });
    });

    it("refuses a file that is not an image the app accepts", async () => {
        const response = await send("thumbnail", 10, "application/pdf");

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("FILE_UNSUPPORTED_TYPE");
    });

    it("refuses a photo over the limit", async () => {
        const response = await send(
            "thumbnail",
            UPLOAD_LIMITS.thumbnail.maxSizeInBytes + 1,
            "image/png"
        );

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("FILE_TOO_LARGE");
    });

    it("does not read a file under another field name", async () => {
        const response = await send("file", 10, "image/png");

        expect(response.status).not.toBe(200);
    });

    it("lets a request with no file through, for the controller to refuse", async () => {
        const response = await fetch(baseUrl, {
            method: "PUT",
            body: new FormData(),
        });

        expect(response.status).toBe(200);
        expect((await response.json()).size).toBeNull();
    });
});
