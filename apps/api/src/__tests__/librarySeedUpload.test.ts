import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    LibrarySeedFilesMissingError,
    MAX_SEED_FILES,
    MAX_SEED_LIBRARY_BYTES,
    MAX_SEED_TOTAL_BYTES,
    MAX_UPLOAD_BYTES,
} from "@standin/contracts";

const mocks = vi.hoisted(() => ({ seedFromFiles: vi.fn() }));
vi.mock("@standin/core", () => ({
    AssetService: { seedFromFiles: mocks.seedFromFiles },
}));

import { seedLibrary } from "@/features/library/controllers/seed";
import {
    handleLibrarySeedUploadError,
    limitLibrarySeedSize,
    uploadLibrarySeed,
} from "@/features/library/middleware/uploadLibrarySeedMiddleware";

// The upload middleware and the controller over HTTP, with the service faked:
// how the parts of the form become the input of the seed.
describe("library seed upload", () => {
    let server: http.Server;
    let baseUrl: string;

    const post = async (form: FormData, query = "") => {
        const response = await fetch(`${baseUrl}/seed${query}`, {
            method: "POST",
            body: form,
        });
        return { status: response.status, body: await response.json() };
    };

    beforeAll(async () => {
        const app = express();
        app.post(
            "/seed",
            (req: any, _res: express.Response, next: express.NextFunction) => {
                req.user = { id: "admin-1" };
                next();
            },
            limitLibrarySeedSize,
            uploadLibrarySeed,
            handleLibrarySeedUploadError,
            seedLibrary
        );
        server = http.createServer(app);
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        mocks.seedFromFiles.mockResolvedValue({ tilesets: [] });
    });

    it("reads library.json from a field and the PNGs by their path", async () => {
        const form = new FormData();
        form.append("library", '{"tilesets":[]}');
        form.append("tilesets/floor.png", new Blob(["png"]), "floor.png");

        const response = await post(form);

        expect(response).toEqual({ status: 200, body: { tilesets: [] } });
        const [input, options] = mocks.seedFromFiles.mock.calls[0]!;
        expect(input.libraryText).toBe('{"tilesets":[]}');
        expect([...input.images.keys()]).toEqual(["tilesets/floor.png"]);
        expect(input.images.get("tilesets/floor.png")!.toString()).toBe("png");
        expect(options).toEqual({ createdBy: "admin-1", dryRun: false });
    });

    it("passes dryRun=true on", async () => {
        const form = new FormData();
        form.append("library", "{}");

        await post(form, "?dryRun=true");

        expect(mocks.seedFromFiles.mock.calls[0]![1].dryRun).toBe(true);
    });

    it("refuses a bad dryRun value", async () => {
        const form = new FormData();
        form.append("library", "{}");

        const response = await post(form, "?dryRun=maybe");

        expect(response.status).toBe(400);
        expect(mocks.seedFromFiles).not.toHaveBeenCalled();
    });

    it("answers 400 when there is no library part", async () => {
        const form = new FormData();
        form.append("a.png", new Blob(["png"]), "a.png");

        const response = await post(form);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("LIBRARY_SEED_FILE_INVALID");
        expect(mocks.seedFromFiles).not.toHaveBeenCalled();
    });

    it("answers 400 with the missing paths as a list", async () => {
        mocks.seedFromFiles.mockRejectedValue(
            new LibrarySeedFilesMissingError(["a.png", "b.png"])
        );
        const form = new FormData();
        form.append("library", "{}");

        const response = await post(form);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("LIBRARY_SEED_FILES_MISSING");
        expect(response.body.paths).toEqual(["a.png", "b.png"]);
        expect(response.body.error).toContain("a.png, b.png");
    });

    it("keeps accents in the path of a file part", async () => {
        const form = new FormData();
        form.append("library", "{}");
        form.append("móveis/cadeira.png", new Blob(["png"]), "cadeira.png");

        await post(form);

        const [input] = mocks.seedFromFiles.mock.calls[0]!;
        expect([...input.images.keys()]).toEqual(["móveis/cadeira.png"]);
    });

    it("refuses a path sent twice", async () => {
        const form = new FormData();
        form.append("library", "{}");
        form.append("a.png", new Blob(["1"]), "a.png");
        form.append("a.png", new Blob(["2"]), "a.png");

        const response = await post(form);

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
            code: "LIBRARY_SEED_DUPLICATE_FILE",
            path: "a.png",
        });
    });

    it("refuses library.json sent as a file", async () => {
        const form = new FormData();
        form.append("library", new Blob(["{}"]), "library.json");

        const response = await post(form);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("LIBRARY_SEED_FILE_INVALID");
        expect(response.body.issues).toHaveLength(1);
    });

    describe("limits", () => {
        it("refuses too many files", async () => {
            const form = new FormData();
            form.append("library", "{}");
            for (let index = 0; index <= MAX_SEED_FILES; index++) {
                form.append(`f${index}.png`, new Blob(["x"]), "f.png");
            }

            const response = await post(form);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("LIBRARY_SEED_TOO_MANY_FILES");
        });

        it("refuses a second text field", async () => {
            const form = new FormData();
            form.append("library", "{}");
            form.append("library", "{}");

            const response = await post(form);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("LIBRARY_SEED_FIELDS_INVALID");
        });

        it("refuses a library field that is too large", async () => {
            const form = new FormData();
            form.append("library", "x".repeat(MAX_SEED_LIBRARY_BYTES + 1));

            const response = await post(form);

            expect(response.status).toBe(413);
            expect(response.body.code).toBe("LIBRARY_SEED_LIBRARY_TOO_LARGE");
        });

        it("refuses a file that is too large", async () => {
            const form = new FormData();
            form.append("library", "{}");
            form.append(
                "big.png",
                new Blob([new Uint8Array(MAX_UPLOAD_BYTES + 1)]),
                "big.png"
            );

            const response = await post(form);

            expect(response.status).toBe(413);
            expect(response.body.code).toBe("LIBRARY_SEED_FILE_TOO_LARGE");
        });

        it("refuses by Content-Length before reading the body", async () => {
            const response = await new Promise<{ status: number; body: any }>(
                (resolve, reject) => {
                    const request = http.request(
                        `${baseUrl}/seed`,
                        {
                            method: "POST",
                            headers: {
                                "content-type":
                                    "multipart/form-data; boundary=x",
                                "content-length": MAX_SEED_TOTAL_BYTES + 1,
                            },
                        },
                        (incoming) => {
                            let text = "";
                            incoming.on("data", (chunk) => (text += chunk));
                            incoming.on("end", () => {
                                resolve({
                                    status: incoming.statusCode!,
                                    body: JSON.parse(text),
                                });
                                request.destroy();
                            });
                        }
                    );
                    request.on("error", reject);
                    request.flushHeaders();
                }
            );

            expect(response.status).toBe(413);
            expect(response.body.code).toBe("LIBRARY_SEED_TOO_LARGE");
            expect(mocks.seedFromFiles).not.toHaveBeenCalled();
        });
    });
});
