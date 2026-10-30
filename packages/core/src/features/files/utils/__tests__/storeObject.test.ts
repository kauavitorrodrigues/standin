import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), remove: vi.fn() }));

vi.mock("@standin/infra", () => ({
    StorageProvider: { upload: mocks.upload, delete: mocks.remove },
}));

import { discardObject, storeObject } from "../storeObject";

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("storeObject", () => {
    it("stores under the folder with a server picked name", async () => {
        const buffer = Buffer.from("abc");

        const stored = await storeObject({
            buffer,
            folder: "soundboard",
            extension: ".mp3",
            mimeType: "audio/mpeg",
        });

        expect(stored.storageKey).toBe(`soundboard/${stored.id}.mp3`);
        expect(stored.sizeInBytes).toBe(3);
        expect(mocks.upload).toHaveBeenCalledWith(
            buffer,
            stored.storageKey,
            "audio/mpeg"
        );
    });
});

describe("discardObject", () => {
    it("removes the object", async () => {
        await discardObject("soundboard/x.mp3");

        expect(mocks.remove).toHaveBeenCalledWith("soundboard/x.mp3");
    });

    it("logs a storage failure instead of throwing", async () => {
        mocks.remove.mockRejectedValue(new Error("down"));

        await expect(discardObject("k")).resolves.toBeUndefined();
    });
});
