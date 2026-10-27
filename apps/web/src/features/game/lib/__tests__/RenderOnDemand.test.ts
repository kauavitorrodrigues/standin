import { describe, expect, it } from "vitest";
import { RenderOnDemand } from "../RenderOnDemand";

type Game = ConstructorParameters<typeof RenderOnDemand>[0];

const createHarness = () => {
    const sprite = { x: 0, y: 0, frame: { name: "a" } };
    const camera = {
        scrollX: 0,
        scrollY: 0,
        zoom: 1,
        width: 800,
        height: 600,
        alpha: 1,
    };
    const scene = {
        children: { list: [sprite] },
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
    return { sprite, camera, drawn, onDemand, step };
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
});
