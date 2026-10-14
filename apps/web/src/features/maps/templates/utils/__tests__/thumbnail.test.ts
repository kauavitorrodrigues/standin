import { describe, expect, it } from "vitest";
import { getThumbnailAspectStyle } from "../getThumbnailAspectStyle";
import { getThumbnailSrc } from "../getThumbnailSrc";

describe("template thumbnail", () => {
    it("keeps the proportion of wide and tall maps", () => {
        expect(getThumbnailAspectStyle(24, 16)).toEqual({
            aspectRatio: "24 / 16",
        });
        expect(getThumbnailAspectStyle(10, 40)).toEqual({
            aspectRatio: "10 / 40",
        });
    });

    it("has no source without a photo", () => {
        expect(getThumbnailSrc(null, "http://localhost:3001")).toBeNull();
    });

    it("puts a file path behind the api address", () => {
        expect(getThumbnailSrc("/files/abc", "http://localhost:3001")).toBe(
            "http://localhost:3001/files/abc"
        );
    });
});
