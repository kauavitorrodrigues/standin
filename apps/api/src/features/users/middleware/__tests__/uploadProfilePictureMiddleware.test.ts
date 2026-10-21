import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import type { Response } from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PROFILE_PICTURE } from "@standin/contracts";
import {
    handleProfilePictureUploadError,
    uploadProfilePictureMiddleware,
} from "../uploadProfilePictureMiddleware";
import type { ExtendedRequest } from "@/types/request";

vi.spyOn(console, "error").mockImplementation(() => {});

describe("uploadProfilePictureMiddleware", () => {
    let server: http.Server;
    let baseUrl: string;

    beforeAll(async () => {
        const app = express();
        app.put(
            "/",
            uploadProfilePictureMiddleware,
            handleProfilePictureUploadError,
            (req: ExtendedRequest, res: Response) => {
                res.status(200).json({
                    size: req.file?.size ?? null,
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

    const send = async (build: (form: FormData) => void) => {
        const form = new FormData();
        build(form);
        const response = await fetch(baseUrl, { method: "PUT", body: form });
        return { status: response.status, body: await response.json() };
    };

    it("reads the file with no other field", async () => {
        const response = await send((form) => {
            form.append(
                "file",
                new Blob([Buffer.alloc(10)], { type: "image/png" }),
                "a.png"
            );
        });

        expect(response).toEqual({ status: 200, body: { size: 10 } });
    });

    it("answers 413 for a file over the limit", async () => {
        const response = await send((form) => {
            form.append(
                "file",
                new Blob([Buffer.alloc(PROFILE_PICTURE.maxBytes + 1)], {
                    type: "image/png",
                }),
                "big.png"
            );
        });

        expect(response.status).toBe(413);
        expect(response.body.code).toBe("PROFILE_PICTURE_TOO_LARGE");
    });

    it("answers 415 for a text field, since the upload takes only the file", async () => {
        const response = await send((form) => {
            form.append(
                "file",
                new Blob([Buffer.alloc(10)], { type: "image/png" }),
                "a.png"
            );
            form.append("crop", "{}");
        });

        expect(response.status).toBe(415);
    });

    it("answers 415 for a file under another field name", async () => {
        const response = await send((form) => {
            form.append(
                "image",
                new Blob([Buffer.alloc(10)], { type: "image/png" }),
                "a.png"
            );
        });

        expect(response.status).toBe(415);
        expect(response.body.code).toBe("PROFILE_PICTURE_UNSUPPORTED_MEDIA");
    });

    it("answers 415 for more than one file", async () => {
        const response = await send((form) => {
            form.append(
                "file",
                new Blob([Buffer.alloc(10)], { type: "image/png" }),
                "a.png"
            );
            form.append(
                "file",
                new Blob([Buffer.alloc(10)], { type: "image/png" }),
                "b.png"
            );
        });

        expect(response.status).toBe(415);
    });

    it("lets a request with no file through, for the controller to refuse", async () => {
        const response = await send((form) => {});

        expect(response).toEqual({ status: 200, body: { size: null } });
    });

    it("answers 422 for a file the filter refuses by mime type or extension", async () => {
        const gif = await send((form) => {
            form.append(
                "file",
                new Blob([Buffer.alloc(10)], { type: "image/gif" }),
                "a.png"
            );
        });
        const text = await send((form) => {
            form.append(
                "file",
                new Blob([Buffer.alloc(10)], { type: "image/png" }),
                "a.txt"
            );
        });

        expect(gif.status).toBe(422);
        expect(gif.body.code).toBe("PROFILE_PICTURE_INVALID");
        expect(text.status).toBe(422);
    });
});

describe("handleProfilePictureUploadError", () => {
    it("lets an error that is not from the upload go on with next(err)", () => {
        const next = vi.fn();
        const res = { status: vi.fn() } as never;
        const error = new Error("token lookup failed");

        handleProfilePictureUploadError(error, {} as never, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect((res as { status: unknown }).status).not.toHaveBeenCalled();
    });
});
