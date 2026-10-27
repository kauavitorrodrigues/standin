import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInNewContext } from "node:vm";
import { setFlagsFromString } from "node:v8";

vi.mock("phaser", () => ({
    default: {
        Scenes: { Events: { SHUTDOWN: "shutdown", RENDER: "render" } },
    },
}));

// The photo needs the API url of the environment. A plain element stands in
// for it, since the tag itself is what is under test.
vi.mock("@/features/users/components/UserAvatar", () => ({
    UserAvatar: () => createElement("img", { alt: "" }),
}));

import { NameTagPill } from "@/features/game/components/NameTagPill";
import { NameTag } from "../NameTag";

// Real React, real overlay view and real pill. Only Phaser is replaced, with
// the few members the overlay reads.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

const AVATARS = 50;

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
    document.body.appendChild(scene.game.domContainer);
    return { scene, frame: () => handlers.get("render")?.() };
};

// React marks the container of every root it creates.
const countReactRoots = (): number =>
    [document.body, ...document.body.querySelectorAll("*")].filter((node) =>
        Object.keys(node).some((key) => key.startsWith("__reactContainer$"))
    ).length;

const collectGarbage = (): void => {
    setFlagsFromString("--expose-gc");
    (runInNewContext("gc") as () => void)();
};

const heapUsed = (): number => {
    collectGarbage();
    collectGarbage();
    return process.memoryUsage().heapUsed;
};

const toMegabytes = (bytes: number): string =>
    (bytes / 1024 / 1024).toFixed(2);

const pillProps = (index: number) => ({
    name: `Avatar ${index}`,
    isLocal: false,
    isDetailed: false,
    userId: `user-${index}`,
    profilePictureUrl: null,
});

describe("NameTagOverlay with a real React render", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = "";
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("draws 50 pills inside their wrappers with one React root", async () => {
        const { scene } = makeScene();
        const tags = Array.from({ length: AVATARS }, (_, index) => {
            const tag = new NameTag({
                scene: scene as never,
                isLocal: false,
                target: { x: index, y: 100 },
            });
            tag.setName(`Avatar ${index}`);
            return tag;
        });

        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        const wrappers = [...scene.game.domContainer.querySelectorAll("aside")];
        expect(tags).toHaveLength(AVATARS);
        expect(wrappers).toHaveLength(AVATARS);
        wrappers.forEach((wrapper, index) => {
            expect(wrapper.textContent).toContain(`Avatar ${index}`);
        });
        expect(countReactRoots()).toBe(1);
    });

    it("the same 50 pills in a root each make 50 roots", async () => {
        const hosts = Array.from({ length: AVATARS }, (_, index) => {
            const host = document.createElement("aside");
            document.body.appendChild(host);
            const root = createRoot(host);
            act(() => {
                root.render(createElement(NameTagPill, pillProps(index)));
            });
            return { host, root };
        });

        expect(countReactRoots()).toBe(AVATARS);
        hosts.forEach(({ root }) => act(() => root.unmount()));
    });

    it("records the heap of 50 tags, a root each and one overlay", async () => {
        const measureRootPerTag = async (): Promise<number> => {
            const before = heapUsed();
            const roots = Array.from({ length: AVATARS }, (_, index) => {
                const host = document.createElement("aside");
                document.body.appendChild(host);
                const root = createRoot(host);
                act(() => {
                    root.render(createElement(NameTagPill, pillProps(index)));
                });
                return root;
            });
            const after = heapUsed();
            roots.forEach((root) => act(() => root.unmount()));
            return after - before;
        };

        const measureOverlay = async (): Promise<number> => {
            const { scene } = makeScene();
            const before = heapUsed();
            const tags = Array.from({ length: AVATARS }, (_, index) => {
                const tag = new NameTag({
                    scene: scene as never,
                    isLocal: false,
                    target: { x: index, y: 100 },
                });
                tag.setName(`Avatar ${index}`);
                return tag;
            });
            await act(async () => {
                vi.advanceTimersByTime(200);
            });
            const after = heapUsed();
            tags.forEach((tag) => tag.destroy());
            return after - before;
        };

        await measureRootPerTag();
        const rootPerTag = await measureRootPerTag();
        await measureOverlay();
        const overlay = await measureOverlay();

        // Heap of the Node process under jsdom, not of a browser tab. It is
        // the same React and the same pill, so the difference is the cost of
        // 50 roots against one.
        process.stderr.write(
            `NAME_TAG_HEAP roots=${AVATARS} rootPerTag=${toMegabytes(rootPerTag)}MB overlay=${toMegabytes(overlay)}MB\n`
        );
        expect(overlay).toBeLessThan(rootPerTag);
    });

    it("places a tag again once its real width is known", async () => {
        let width = 0;
        const callbacks: (() => void)[] = [];
        vi.stubGlobal(
            "ResizeObserver",
            class {
                constructor(callback: () => void) {
                    callbacks.push(callback);
                }
                observe() {}
                disconnect() {}
            }
        );
        const clientWidth = vi
            .spyOn(HTMLElement.prototype, "clientWidth", "get")
            .mockImplementation(() => width);
        const clientHeight = vi
            .spyOn(HTMLElement.prototype, "clientHeight", "get")
            .mockImplementation(() => (width === 0 ? 0 : 28));

        const { scene, frame } = makeScene();
        const tag = new NameTag({
            scene: scene as never,
            isLocal: false,
            target: { x: 400, y: 300 },
        });
        tag.setName("Ana");
        const node = scene.game.domContainer.querySelector(
            "aside"
        ) as HTMLElement;

        // First appearance: the node was hidden, so it reads width 0.
        frame();
        const unmeasured = node.style.transform;
        expect(node.style.display).toBe("block");

        // The pill is drawn and the observer reports the real width.
        width = 80;
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        callbacks.forEach((callback) => callback());
        frame();

        expect(node.textContent).toContain("Ana");
        expect(node.style.transform).not.toBe(unmeasured);
        expect(node.style.transformOrigin).toBe("50% 100%");
        expect(node.style.position).toBe("absolute");
        expect(node.style.pointerEvents).toBe("none");

        clientWidth.mockRestore();
        clientHeight.mockRestore();
    });

    it("shows a name, a typing change and a photo toggle within 100 ms", async () => {
        const { scene } = makeScene();
        const tag = new NameTag({
            scene: scene as never,
            isLocal: false,
            target: { x: 0, y: 0 },
        });
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        tag.setName("Ana");
        tag.setProfile({ userId: "u1", profilePictureUrl: null });
        tag.setTyping(true);
        tag.setDetailed(true);
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const node = scene.game.domContainer.querySelector("aside");
        expect(node?.textContent).toContain("Ana");
        expect(node?.querySelector("svg")).toBeNull();
    });
});
