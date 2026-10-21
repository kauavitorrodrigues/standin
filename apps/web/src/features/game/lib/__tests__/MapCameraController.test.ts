import { describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";

// Phaser draws to a canvas when it loads, which a test has no use for. The
// controller only reads it when it zooms, and these tests do not.
vi.mock("phaser", () => ({ default: {} }));

import { MapCameraController } from "../MapCameraController";

type FakeCamera = {
    zoom: number;
    zoomX: number;
    zoomY: number;
    scrollX: number;
    scrollY: number;
    useBounds: boolean;
    renderRoundPixels: boolean;
    clampX: (x: number) => number;
    clampY: (y: number) => number;
    // What Phaser's own preRender does to the scroll: a follow sets it, a still
    // camera leaves it.
    onPreRender: (camera: FakeCamera) => void;
    preRender: () => void;
};

// A camera with the parts of Phaser's that the controller touches. Its own
// `preRender` runs `onPreRender`, which stands for the follow.
const makeCamera = (over: Partial<FakeCamera> = {}) => {
    const camera: FakeCamera = {
        zoom: 4,
        zoomX: 4,
        zoomY: 4,
        scrollX: 0,
        scrollY: 0,
        useBounds: false,
        renderRoundPixels: false,
        clampX: (x) => x,
        clampY: (y) => y,
        onPreRender: () => {},
        preRender() {
            camera.onPreRender(camera);
        },
        ...over,
    };
    return camera;
};

const controllerFor = (camera: FakeCamera) =>
    new MapCameraController(
        camera as unknown as Phaser.Cameras.Scene2D.Camera,
        4000,
        4000,
        vi.fn()
    );

describe("MapCameraController scroll snapping", () => {
    it("moves the scroll of a following camera to a whole screen px", () => {
        const camera = makeCamera({
            onPreRender: (c) => {
                c.scrollX = 10.1;
                c.scrollY = 20.4;
            },
        });
        controllerFor(camera);

        camera.preRender();

        expect(camera.scrollX).toBe(10);
        expect(camera.scrollY).toBe(20.5);
    });

    it("snaps the drawing to whole px only at a whole zoom", () => {
        const camera = makeCamera();
        controllerFor(camera);

        camera.preRender();
        expect(camera.renderRoundPixels).toBe(true);

        camera.zoomX = camera.zoomY = camera.zoom = 1.5;
        camera.preRender();
        expect(camera.renderRoundPixels).toBe(false);
    });

    it("starts a still frame from the exact scroll, not the snapped one it shows", () => {
        const seen: number[] = [];
        const camera = makeCamera({
            scrollX: 10.3,
            onPreRender: (c) => {
                seen.push(c.scrollX);
            },
        });
        controllerFor(camera);

        camera.preRender();
        camera.preRender();
        camera.preRender();

        expect(camera.scrollX).toBe(10.25);
        expect(seen).toEqual([10.3, 10.3, 10.3]);
    });

    it("adds up a drag of a fraction of a screen px per frame", () => {
        const camera = makeCamera({ scrollX: 100, scrollY: 100 });
        const controller = controllerFor(camera);
        camera.preRender();

        // 0.3 screen px, four times: 1.2 screen px, which is 0.3 world px.
        for (let i = 0; i < 4; i++) {
            controller.pan(0.3, 0);
            camera.preRender();
        }

        // 99.7 snaps to a quarter of a world px, which is a screen px at zoom 4.
        expect(camera.scrollX).toBe(99.75);
    });

    it("takes a scroll that someone else set as it is", () => {
        const camera = makeCamera({ scrollX: 10.3 });
        controllerFor(camera);
        camera.preRender();

        camera.scrollX = 500.1;
        camera.preRender();

        expect(camera.scrollX).toBe(500);
    });

    it("never goes past the edge of the map because of the rounding", () => {
        const camera = makeCamera({
            useBounds: true,
            clampX: (x) => Math.min(x, 50.13),
            onPreRender: (c) => {
                c.scrollX = 50.13;
            },
        });
        controllerFor(camera);

        camera.preRender();

        // 50.13 would snap up to 50.25, past the edge.
        expect(camera.scrollX).toBeLessThanOrEqual(50.13);
    });

    it("leaves a camera without preRender alone", () => {
        const camera = {} as unknown as Phaser.Cameras.Scene2D.Camera;

        expect(
            () => new MapCameraController(camera, 100, 100, vi.fn())
        ).not.toThrow();
    });
});
