import { describe, expect, it } from "vitest";
import {
    computeDomTransform,
    getCounterZoomScale,
    type Matrix2D,
} from "../computeDomTransform";

// A camera of zoom `zoom` centered on a 800 x 600 view, as Phaser builds it.
const cameraAt = (zoom: number): Matrix2D => ({
    a: zoom,
    b: 0,
    c: 0,
    d: zoom,
    e: 400 - 400 * zoom,
    f: 300 - 300 * zoom,
});

const base = {
    scroll: { x: 100, y: 50 },
    position: { x: 300, y: 250 },
    size: { width: 60, height: 14 },
    origin: { x: 0.5, y: 1 },
};

// The point of the screen the anchor of the element lands on.
const anchorOnScreen = (camera: Matrix2D) => ({
    x: camera.a * (base.position.x - base.scroll.x) + camera.e,
    y: camera.d * (base.position.y - base.scroll.y) + camera.f,
});

const parse = (css: string): number[] =>
    (css.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe("computeDomTransform", () => {
    it("keeps the size at zoom 1 and moves by the anchor, as a translation", () => {
        const css = computeDomTransform({
            ...base,
            camera: cameraAt(1),
            scale: 1,
        });

        // anchor (200, 200) minus half the width and the whole height
        expect(css).toBe("translate(170px, 186px)");
    });

    it("snaps the translation to whole px when asked, so it moves with the sprites", () => {
        const css = computeDomTransform({
            ...base,
            position: { x: 300.4, y: 250.6 },
            camera: cameraAt(1),
            scale: 1,
            roundToPixel: true,
        });

        expect(css).toBe("translate(170px, 187px)");
    });

    it("leaves the translation as it is when not asked", () => {
        const css = computeDomTransform({
            ...base,
            position: { x: 300.4, y: 250.6 },
            camera: cameraAt(1),
            scale: 1,
        });

        const [e, f] = parse(css);
        expect(e).toBeCloseTo(170.4);
        expect(f).toBeCloseTo(186.6);
    });

    it("grows with the camera when it scales with the zoom", () => {
        const css = computeDomTransform({
            ...base,
            camera: cameraAt(2),
            scale: 1,
        });

        expect(css.startsWith("matrix(2, 0, 0, 2,")).toBe(true);
    });

    it.each([0.5, 1, 2, 4])(
        "keeps the size on the screen at zoom %s with the counter scale",
        (zoom) => {
            const css = computeDomTransform({
                ...base,
                camera: cameraAt(zoom),
                scale: getCounterZoomScale(zoom),
            });

            const [a, , , d] = parse(css);
            // A translation has no matrix part, which is a scale of 1.
            expect(css.startsWith("translate(") ? 1 : a).toBeCloseTo(1);
            expect(css.startsWith("translate(") ? 1 : d).toBeCloseTo(1);
        }
    );

    it.each([0.5, 2, 4])(
        "leaves the anchor on the same screen point whatever the scale, at zoom %s",
        (zoom) => {
            const camera = cameraAt(zoom);
            const anchor = anchorOnScreen(camera);

            [1, getCounterZoomScale(zoom)].forEach((scale) => {
                const css = computeDomTransform({ ...base, camera, scale });
                const nums = parse(css);
                const [e, f] = css.startsWith("translate(")
                    ? [nums[0]!, nums[1]!]
                    : [nums[4]!, nums[5]!];

                // The origin of the element is the anchor, so the element is
                // laid out with its origin at (e + width/2, f + height).
                expect(e + base.size.width * base.origin.x).toBeCloseTo(
                    anchor.x
                );
                expect(f + base.size.height * base.origin.y).toBeCloseTo(
                    anchor.y
                );
            });
        }
    );
});

describe("getCounterZoomScale", () => {
    it("is the inverse of the zoom", () => {
        expect(getCounterZoomScale(0.5)).toBe(2);
        expect(getCounterZoomScale(4)).toBe(0.25);
    });

    it("is 1 for a zoom that is not positive", () => {
        expect(getCounterZoomScale(0)).toBe(1);
    });
});
