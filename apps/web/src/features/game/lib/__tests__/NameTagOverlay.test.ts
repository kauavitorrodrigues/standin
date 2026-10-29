import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { rootMock, createRootMock } = vi.hoisted(() => {
    const rootMock = { render: vi.fn(), unmount: vi.fn() };
    return { rootMock, createRootMock: vi.fn(() => rootMock) };
});

vi.mock("@/features/game/components/NameTagOverlayView", () => ({
    NameTagOverlayView: () => null,
}));
vi.mock("react-dom/client", () => ({ createRoot: createRootMock }));
vi.mock("phaser", () => ({
    default: {
        Scenes: { Events: { SHUTDOWN: "shutdown", RENDER: "render" } },
    },
}));

import { NameTag } from "../NameTag";
import { getNameTagOverlayStats } from "../NameTagOverlay";

const makeScene = () => {
    const handlers = new Map<string, () => void>();
    const scene = {
        game: { domContainer: document.createElement("div") },
        events: {
            on: (name: string, fn: () => void, ctx?: object) =>
                handlers.set(name, fn.bind(ctx)),
            once: vi.fn(),
            off: vi.fn(),
        },
        cameras: {
            main: {
                matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
                scrollX: 0,
                scrollY: 0,
                zoom: 1,
                renderRoundPixels: false,
                worldView: { x: 0, y: 0, right: 800, bottom: 600 },
            },
        },
    };
    return { scene, frame: () => handlers.get("render")?.() };
};

describe("NameTagOverlay", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });
    afterEach(() => vi.useRealTimers());

    it("uses one React root for 50 avatars", () => {
        const { scene } = makeScene();

        const tags = Array.from({ length: 50 }, (_, index) => {
            const tag = new NameTag({
                scene: scene as never,
                isLocal: false,
                target: { x: index, y: 100 },
            });
            tag.setName(`Avatar ${index}`);
            return tag;
        });
        vi.advanceTimersByTime(1000);

        expect(tags).toHaveLength(50);
        expect(createRootMock).toHaveBeenCalledTimes(1);
        expect(scene.game.domContainer.querySelectorAll("aside")).toHaveLength(
            50
        );
        expect(getNameTagOverlayStats()).toEqual({ roots: 1, tags: 50 });
    });

    it("draws the content at most every 100 ms", () => {
        const { scene } = makeScene();
        const tag = new NameTag({
            scene: scene as never,
            isLocal: false,
            target: { x: 0, y: 0 },
        });
        vi.advanceTimersByTime(0);
        rootMock.render.mockClear();

        tag.setName("Ana");
        tag.setTyping(true);
        tag.setTyping(false);
        vi.advanceTimersByTime(99);
        expect(rootMock.render.mock.calls.length).toBeLessThanOrEqual(1);

        vi.advanceTimersByTime(200);
        expect(rootMock.render).toHaveBeenCalledTimes(1);
    });

    it("writes the position only when something moved", () => {
        const { scene, frame } = makeScene();
        const feet = { x: 100, y: 200 };
        const tag = new NameTag({
            scene: scene as never,
            isLocal: false,
            target: feet,
        });
        tag.setName("Ana");
        const node = scene.game.domContainer.querySelector(
            "aside"
        ) as HTMLElement;

        frame();
        expect(node.style.display).toBe("block");
        const first = node.style.transform;
        expect(first).toContain("translate(");

        const spy = vi.spyOn(node.style, "transform", "set");
        frame();
        expect(spy).not.toHaveBeenCalled();

        feet.x = 150;
        frame();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("removes the wrapper of a destroyed tag and keeps the root", () => {
        const { scene } = makeScene();
        const tag = new NameTag({
            scene: scene as never,
            isLocal: true,
            target: { x: 0, y: 0 },
        });

        tag.destroy();

        expect(scene.game.domContainer.querySelectorAll("aside")).toHaveLength(
            0
        );
        expect(rootMock.unmount).not.toHaveBeenCalled();
    });
});
