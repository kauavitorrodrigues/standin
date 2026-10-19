import { describe, expect, it } from "vitest";
import {
    AVATAR_OUTLINE,
    AVATAR_OUTLINE_STYLES,
} from "@/features/game/consts/avatar-outline";
import { buildAvatarOutlinePixels } from "@/features/game/utils/buildAvatarOutlinePixels";

const WIDTH = 5;
const HEIGHT = 5;

// A 3x3 gray body in the middle of an empty frame, with a white pixel at its
// center.
const buildFrame = (): Uint8ClampedArray => {
    const frame = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    for (let y = 1; y <= 3; y++) {
        for (let x = 1; x <= 3; x++) {
            const at = (y * WIDTH + x) * 4;
            frame.set([100, 100, 100, 255], at);
        }
    }
    frame.set([255, 255, 255, 255], (2 * WIDTH + 2) * 4);
    return frame;
};

const pixelAt = (
    result: ReturnType<typeof buildAvatarOutlinePixels>,
    x: number,
    y: number
) => {
    const at =
        ((y + AVATAR_OUTLINE.PADDING_PX) * result.width +
            (x + AVATAR_OUTLINE.PADDING_PX)) *
        4;
    return Array.from(result.pixels.slice(at, at + 4));
};

describe("buildAvatarOutlinePixels", () => {
    const result = buildAvatarOutlinePixels(
        buildFrame(),
        WIDTH,
        HEIGHT,
        AVATAR_OUTLINE_STYLES.FULL
    );
    const { RING_COLOR, EDGE_COLOR } = AVATAR_OUTLINE;

    it("grows the canvas by the padding on each side", () => {
        expect(result.width).toBe(WIDTH + AVATAR_OUTLINE.PADDING_PX * 2);
        expect(result.height).toBe(HEIGHT + AVATAR_OUTLINE.PADDING_PX * 2);
    });

    it("draws a ring one step out from the body, and none at the corner", () => {
        expect(pixelAt(result, 0, 2)).toEqual([
            RING_COLOR.r,
            RING_COLOR.g,
            RING_COLOR.b,
            255,
        ]);
        expect(pixelAt(result, 0, 0)[3]).toBe(0);
    });

    it("paints the edge of the body and the pixels beside a light detail", () => {
        const edge = [EDGE_COLOR.r, EDGE_COLOR.g, EDGE_COLOR.b, 255];
        expect(pixelAt(result, 1, 2)).toEqual(edge);
        expect(pixelAt(result, 2, 1)).toEqual(edge);
    });

    it("keeps the light detail as it was", () => {
        expect(pixelAt(result, 2, 2)).toEqual([255, 255, 255, 255]);
    });

    it("leaves the body empty in the ring only style", () => {
        const ringOnly = buildAvatarOutlinePixels(
            buildFrame(),
            WIDTH,
            HEIGHT,
            AVATAR_OUTLINE_STYLES.RING_ONLY
        );
        expect(pixelAt(ringOnly, 2, 2)[3]).toBe(0);
        expect(pixelAt(ringOnly, 0, 2)).toEqual([
            RING_COLOR.r,
            RING_COLOR.g,
            RING_COLOR.b,
            255,
        ]);
    });
});
