import { describe, expect, it, vi } from "vitest";
import { PROFILE_PICTURE } from "@standin/contracts";
import { validateProfilePictureFile } from "../validateProfilePictureFile";

const run = (mimetype: string, size: number) => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const ok = validateProfilePictureFile({ mimetype, size } as never, res);
    return { ok, res };
};

describe("validateProfilePictureFile", () => {
    it("accepts a PNG, JPEG or WebP within the size", () => {
        for (const type of PROFILE_PICTURE.acceptedMimeTypes) {
            const { ok, res } = run(type, 1000);
            expect(ok).toBe(true);
            expect(res.status).not.toHaveBeenCalled();
        }
    });

    it("answers 422 for another mime type", () => {
        const { ok, res } = run("image/gif", 1000);

        expect(ok).toBe(false);
        expect(res.status).toHaveBeenCalledWith(422);
    });

    it("answers 413 for a file over the size", () => {
        const { ok, res } = run("image/png", PROFILE_PICTURE.maxBytes + 1);

        expect(ok).toBe(false);
        expect(res.status).toHaveBeenCalledWith(413);
    });
});
