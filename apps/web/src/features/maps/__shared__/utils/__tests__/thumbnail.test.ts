import { describe, expect, it, vi } from "vitest";
import { MAX_THUMBNAIL_ASPECT_DRIFT } from "@standin/contracts";
import { EDITOR_THUMBNAIL } from "@/features/editor/consts/thumbnail";
import { getThumbnailSize } from "@/features/editor/utils/getThumbnailSize";
import { saveMapThumbnail } from "@/features/maps/__shared__/utils/saveMapThumbnail";

describe("getThumbnailSize", () => {
    it("puts the longest side at the ceiling", () => {
        expect(getThumbnailSize({ width: 3200, height: 3200 })).toEqual({
            width: EDITOR_THUMBNAIL.MAX_SIDE,
            height: EDITOR_THUMBNAIL.MAX_SIDE,
        });
        expect(getThumbnailSize({ width: 3200, height: 1600 })).toEqual({
            width: 640,
            height: 320,
        });
        expect(getThumbnailSize({ width: 1600, height: 3200 })).toEqual({
            width: 320,
            height: 640,
        });
    });

    it("scales small maps up", () => {
        expect(getThumbnailSize({ width: 320, height: 160 })).toEqual({
            width: 640,
            height: 320,
        });
    });

    it("keeps the proportion within the server tolerance", () => {
        const map = { width: 99 * 32, height: 61 * 32 };
        const size = getThumbnailSize(map);
        const drift = Math.abs(
            size.width / size.height / (map.width / map.height) - 1
        );

        expect(drift).toBeLessThan(MAX_THUMBNAIL_ASPECT_DRIFT);
    });

    it("never returns a side below one pixel", () => {
        expect(getThumbnailSize({ width: 100000, height: 1 }).height).toBe(1);
    });
});

describe("saveMapThumbnail", () => {
    const blob = new Blob(["png"]);

    it("saves what was captured", async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        await saveMapThumbnail(() => Promise.resolve(blob), save);

        expect(save).toHaveBeenCalledWith(blob);
    });

    it("swallows a failed capture and does not save", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const save = vi.fn();

        await expect(
            saveMapThumbnail(() => Promise.reject(new Error("x")), save)
        ).resolves.toBeUndefined();
        expect(save).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("swallows a failed save", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const save = vi.fn().mockRejectedValue(new Error("x"));

        await expect(
            saveMapThumbnail(() => Promise.resolve(blob), save)
        ).resolves.toBeUndefined();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
