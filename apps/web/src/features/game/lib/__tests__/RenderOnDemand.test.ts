import { describe, expect, it } from "vitest";
import { RENDER_ON_DEMAND } from "../../consts/render-on-demand";
import { RenderOnDemand } from "../RenderOnDemand";

type Game = ConstructorParameters<typeof RenderOnDemand>[0];

const createHarness = () => {
    const sprite = { x: 0, y: 0, frame: { name: "a" } };
    // Scenery that animates by itself, marked as ambient like the sprites of
    // animated objects are.
    const water = {
        x: 5,
        y: 5,
        frame: { name: "w0" },
        getData: (key: string) => key === "ambient",
    };
    const camera = {
        scrollX: 0,
        scrollY: 0,
        zoom: 1,
        width: 800,
        height: 600,
        alpha: 1,
    };
    const scene = {
        children: { list: [sprite, water] },
        cameras: { cameras: [camera] },
    };
    const drawn = { value: 0 };
    const renderer = {
        preRender: () => undefined,
        postRender: () => undefined,
    };
    const sceneManager = {
        render: () => {
            drawn.value += 1;
        },
        getScenes: () => [scene],
    };
    const noop = { on: () => undefined, off: () => undefined };
    const game = {
        renderer,
        scene: sceneManager,
        scale: noop,
        textures: noop,
        events: { once: () => undefined },
    } as unknown as Game;
    const clock = { now: 0 };
    const onDemand = new RenderOnDemand(game, () => clock.now);
    onDemand.install();

    // One loop step: preRender, scene render, postRender, as Phaser does.
    const step = (advanceMs: number) => {
        clock.now += advanceMs;
        renderer.preRender();
        sceneManager.render();
        renderer.postRender();
    };
    return { sprite, water, camera, drawn, onDemand, step };
};

describe("RenderOnDemand", () => {
    it("draws the first frame, then nothing while the scene is still", () => {
        const { drawn, step } = createHarness();

        for (let i = 0; i < 600; i++) step(16.7);

        expect(drawn.value).toBe(1);
    });

    it("caps the passes while an avatar walks every frame", () => {
        const { sprite, drawn, step } = createHarness();
        step(16.7);
        drawn.value = 0;

        for (let i = 0; i < 600; i++) {
            sprite.x += 2;
            step(16.7);
        }

        const seconds = (600 * 16.7) / 1000;
        expect(drawn.value / seconds).toBeLessThanOrEqual(36.5);
        expect(drawn.value / seconds).toBeGreaterThan(20);
    });

    it("draws a change held back by the cadence on the next due frame", () => {
        const { sprite, drawn, step } = createHarness();
        step(16.7);
        drawn.value = 0;

        sprite.x = 10;
        step(5);
        expect(drawn.value).toBe(0);
        step(30);
        expect(drawn.value).toBe(1);
        step(100);
        expect(drawn.value).toBe(1);
    });

    it("draws a frame change, a camera move and a forced mark", () => {
        const { sprite, camera, drawn, onDemand, step } = createHarness();
        step(100);

        sprite.frame = { name: "b" };
        step(100);
        camera.scrollX = 5;
        step(100);
        onDemand.markDirty();
        step(1);

        expect(drawn.value).toBe(4);
        expect(onDemand.renderPasses).toBe(4);
    });

    it("draws everything again after uninstall", () => {
        const { drawn, onDemand, step } = createHarness();
        step(100);
        onDemand.uninstall();

        step(1);
        step(1);

        expect(drawn.value).toBe(3);
    });

    describe("the budgets of the render cadence", () => {
        const FRAME_MS = 1000 / 60;
        const FRAMES = 600;
        const seconds = (FRAMES * FRAME_MS) / 1000;

        it("an idle scene draws nothing after the first frame", () => {
            const { drawn, step } = createHarness();
            step(FRAME_MS);
            drawn.value = 0;

            for (let i = 0; i < FRAMES; i++) step(FRAME_MS);

            expect(drawn.value).toBe(0);
        });

        it("scenery that only animates is drawn at the ambient cadence, not the walking one", () => {
            const { water, drawn, step } = createHarness();
            step(FRAME_MS);
            drawn.value = 0;

            // The frame of the water changes on every loop step.
            for (let i = 0; i < FRAMES; i++) {
                water.frame = { name: `w${i}` };
                step(FRAME_MS);
            }

            const perSecond = drawn.value / seconds;
            expect(perSecond).toBeLessThanOrEqual(RENDER_ON_DEMAND.AMBIENT_HZ + 0.5);
            expect(perSecond).toBeGreaterThan(RENDER_ON_DEMAND.AMBIENT_HZ - 1);
        });

        it("walking stays within the walking cadence, and the water comes along for free", () => {
            const { sprite, water, drawn, step } = createHarness();
            step(FRAME_MS);
            drawn.value = 0;

            for (let i = 0; i < FRAMES; i++) {
                sprite.x += 2;
                water.frame = { name: `w${i}` };
                step(FRAME_MS);
            }

            expect(drawn.value / seconds).toBeLessThanOrEqual(
                RENDER_ON_DEMAND.MOVING_HZ + 0.5
            );
        });

        it("a move that arrives during a quiet scenery frame is not held back by the ambient cadence", () => {
            const { sprite, drawn, step } = createHarness();
            step(FRAME_MS);
            drawn.value = 0;

            sprite.x = 50;
            step(40);

            expect(drawn.value).toBe(1);
        });

        it("still draws a held back scenery change once the ambient cadence is due", () => {
            const { water, drawn, step } = createHarness();
            step(FRAME_MS);
            drawn.value = 0;

            water.frame = { name: "w1" };
            step(100);
            expect(drawn.value).toBe(0);
            step(1000 / RENDER_ON_DEMAND.AMBIENT_HZ);
            expect(drawn.value).toBe(1);
        });

        it("an ambient change does not raise the walking cadence of the next move", () => {
            expect(RENDER_ON_DEMAND.AMBIENT_HZ).toBeLessThan(RENDER_ON_DEMAND.MOVING_HZ);
        });
    });
});
