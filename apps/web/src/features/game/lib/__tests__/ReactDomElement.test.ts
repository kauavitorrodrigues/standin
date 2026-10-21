import { beforeEach, describe, expect, it, vi } from "vitest";

const { rootMock, createRootMock } = vi.hoisted(() => {
    const rootMock = { render: vi.fn(), unmount: vi.fn() };
    return { rootMock, createRootMock: vi.fn(() => rootMock) };
});

vi.mock("react-dom/client", () => ({ createRoot: createRootMock }));

// The part of a Phaser DOM element that the bridge builds on: it holds the
// node, the position, the size and the origin, and clears its scene when it is
// destroyed, like the real one.
vi.mock("phaser", () => {
    class FakeDOMElement {
        scene: unknown;
        node: HTMLElement | null = null;
        x = 0;
        y = 0;
        width = 0;
        height = 0;
        originX = 0.5;
        originY = 0.5;
        visible = true;
        pointerEvents = "auto";

        constructor(scene: unknown, x: number, y: number) {
            this.scene = scene;
            this.x = x;
            this.y = y;
        }

        setElement(element: HTMLElement) {
            this.node = element;
            return this;
        }

        setPosition(x: number, y: number) {
            this.x = x;
            this.y = y;
            return this;
        }

        setOrigin(x: number, y: number = x) {
            this.originX = x;
            this.originY = y;
            return this;
        }

        setVisible(isVisible: boolean) {
            this.visible = isVisible;
            return this;
        }

        updateSize() {
            this.width = this.node?.clientWidth ?? 0;
            this.height = this.node?.clientHeight ?? 0;
            return this;
        }

        destroy() {
            this.scene = undefined;
        }
    }

    return { default: { GameObjects: { DOMElement: FakeDOMElement } } };
});

import { ReactDomElement } from "../ReactDomElement";

type Camera = Parameters<typeof renderOf>[1];

const renderOf = (element: unknown, camera: object) =>
    (
        element as {
            renderWebGL: (r: unknown, s: unknown, c: object) => void;
        }
    ).renderWebGL(null, null, camera);

const makeCamera = (over: Record<string, unknown> = {}): Camera => ({
    matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
    renderRoundPixels: false,
    worldView: { x: 0, y: 0, right: 800, bottom: 600 },
    ...over,
});

const Component = () => null;

const makeElement = (scalesWithZoom = false) => {
    const scene = { add: { existing: vi.fn() } };
    const element = new ReactDomElement(
        scene as never,
        100,
        200,
        Component,
        { name: "Ana" },
        { scalesWithZoom }
    );
    // The element is 60 x 28 once it is on the screen.
    Object.defineProperty(element.node as HTMLElement, "clientWidth", {
        configurable: true,
        value: 60,
    });
    Object.defineProperty(element.node as HTMLElement, "clientHeight", {
        configurable: true,
        value: 28,
    });
    element.updateSize();
    return { element, scene, node: element.node as HTMLElement };
};

describe("ReactDomElement", () => {
    beforeEach(() => vi.clearAllMocks());

    it("adds itself to the scene and draws its props once", () => {
        const { scene } = makeElement();

        expect(scene.add.existing).toHaveBeenCalledTimes(1);
        expect(rootMock.render).toHaveBeenCalledTimes(1);
    });

    it("never takes the mouse", () => {
        const { element, node } = makeElement();

        expect(element.pointerEvents).toBe("none");
        expect(node.style.pointerEvents).toBe("none");
    });

    it("draws again only when a prop changed", () => {
        const { element } = makeElement();
        rootMock.render.mockClear();

        element.setProps({ name: "Ana" });
        expect(rootMock.render).not.toHaveBeenCalled();

        element.setProps({ name: "Ana Souza" });
        expect(rootMock.render).toHaveBeenCalledTimes(1);
    });

    describe("placing it on the screen", () => {
        it("starts hidden and shows when it is drawn in the view", () => {
            const { element, node } = makeElement();
            expect(node.style.display).toBe("none");

            renderOf(element, makeCamera());

            expect(node.style.display).toBe("block");
        });

        it("centers it over its anchor, with its bottom on the point", () => {
            const { element, node } = makeElement();
            element.setOrigin(0.5, 1);

            renderOf(element, makeCamera());

            // x 100 - 60 / 2, y 200 - 28
            expect(node.style.transform).toBe("translate(70px, 172px)");
        });

        it("keeps its size at any zoom, and only the position follows", () => {
            const { element, node } = makeElement(false);
            element.setOrigin(0.5, 1);

            renderOf(
                element,
                makeCamera({
                    zoom: 2,
                    matrix: { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 },
                })
            );

            // The anchor lands on (200, 400) of the screen: no scale, only a move.
            expect(node.style.transform).toBe("translate(170px, 372px)");
        });

        it("grows with the zoom when it scales with it", () => {
            const { element, node } = makeElement(true);
            element.setOrigin(0.5, 1);

            renderOf(
                element,
                makeCamera({
                    zoom: 2,
                    matrix: { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 },
                })
            );

            expect(node.style.transform.startsWith("matrix(2, 0, 0, 2,")).toBe(
                true
            );
        });

        it("hides it when it is out of the view", () => {
            const { element, node } = makeElement();
            renderOf(element, makeCamera());
            expect(node.style.display).toBe("block");

            renderOf(
                element,
                makeCamera({
                    worldView: { x: 2000, y: 2000, right: 2800, bottom: 2600 },
                })
            );

            expect(node.style.display).toBe("none");
        });

        it("hides it when it is not visible", () => {
            const { element, node } = makeElement();
            renderOf(element, makeCamera());

            element.setShown(false);
            renderOf(element, makeCamera());

            expect(node.style.display).toBe("none");
        });

        it("writes the transform only when it changed", () => {
            const { element, node } = makeElement();
            const writes: string[] = [];
            let value = "";
            Object.defineProperty(node.style, "transform", {
                configurable: true,
                get: () => value,
                set: (next: string) => {
                    writes.push(next);
                    value = next;
                },
            });

            renderOf(element, makeCamera());
            renderOf(element, makeCamera());
            renderOf(element, makeCamera());
            expect(writes).toHaveLength(1);

            element.setPosition(101, 200);
            renderOf(element, makeCamera());
            expect(writes).toHaveLength(2);
        });

        it("reads the position when it is drawn, not when it was set", () => {
            const { element, node } = makeElement();
            element.setOrigin(0.5, 1);
            const feet = { x: 100, y: 200 };
            element.setPositionSource(() => feet);
            renderOf(element, makeCamera());
            expect(node.style.transform).toBe("translate(70px, 172px)");

            // The sprite moved after the scene updated and before it was drawn.
            feet.x = 150;
            renderOf(element, makeCamera());

            expect(node.style.transform).toBe("translate(120px, 172px)");
        });

        it("snaps to whole px when the camera does", () => {
            const { element, node } = makeElement();
            element.setOrigin(0.5, 1);
            element.setPositionSource(() => ({ x: 100.4, y: 200.6 }));

            renderOf(element, makeCamera({ renderRoundPixels: true }));

            expect(node.style.transform).toBe("translate(70px, 173px)");
        });

        it("measures itself when it shows again, so it is not off center for a frame", () => {
            const { element, node } = makeElement();
            element.setOrigin(0.5, 1);
            renderOf(element, makeCamera());
            element.setShown(false);
            renderOf(element, makeCamera());
            // Hidden, the size read is 0.
            (element as { width: number }).width = 0;

            element.setShown(true);
            renderOf(element, makeCamera());

            expect(node.style.transform).toBe("translate(70px, 172px)");
        });
    });

    describe("destroying it", () => {
        it("unmounts the React root after the render pass", async () => {
            const { element } = makeElement();

            element.destroy();
            expect(rootMock.unmount).not.toHaveBeenCalled();

            await Promise.resolve();
            expect(rootMock.unmount).toHaveBeenCalledTimes(1);
        });

        it("does nothing the second time, as when the scene shuts down after it", async () => {
            const { element } = makeElement();

            element.destroy();
            element.destroy();
            await Promise.resolve();

            expect(rootMock.unmount).toHaveBeenCalledTimes(1);
        });
    });
});
