import { describe, expect, it } from "vitest";
import { getThumbnailStyle } from "../getThumbnailStyle";

describe("getThumbnailStyle", () => {
    it("fits a static sprite in the box", () => {
        expect(
            getThumbnailStyle(
                { url: "/files/a", sprite: { w: 64, h: 32 }, frameCount: 1 },
                "http://x/files/a",
                128
            )
        ).toMatchObject({
            width: 128,
            height: 64,
            backgroundSize: "128px 64px",
            backgroundPosition: "0 0",
        });
    });

    it("shows only the first frame of a strip", () => {
        expect(
            getThumbnailStyle(
                { url: "/files/a", sprite: { w: 32, h: 64 }, frameCount: 6 },
                "http://x/files/a",
                64
            )
        ).toMatchObject({
            width: 32,
            height: 64,
            backgroundSize: "192px 64px",
        });
    });

    it("never zooms past maxScale", () => {
        const style = getThumbnailStyle(
            { url: "/files/a", sprite: { w: 32, h: 32 }, frameCount: 1 },
            "http://x/files/a",
            160,
            1.5
        );
        expect(style.width).toBe(48);
    });
});
