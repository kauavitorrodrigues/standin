import Phaser from "phaser";
import { createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
    computeDomTransform,
    getCounterZoomScale,
    type Matrix2D,
} from "@/features/game/utils/computeDomTransform";

type Options = {
    // The tag keeps its size on the screen when false. See `NAME_TAG`.
    scalesWithZoom: boolean;
};

// What Phaser keeps on the camera that its typings leave out.
type CameraWithMatrix = Phaser.Cameras.Scene2D.Camera & {
    matrix: Matrix2D;
    renderRoundPixels: boolean;
};

type WorldPoint = { x: number; y: number };

const isShallowEqual = (a: object, b: object): boolean => {
    const keys = Object.keys(a) as (keyof typeof a)[];
    return (
        keys.length === Object.keys(b).length &&
        keys.every((key) => a[key] === b[key as keyof typeof b])
    );
};

// A React component in a DOM element that Phaser places over a point of the
// world. Phaser only moves it, and React draws what is inside. It needs
// `dom.createContainer` on the game, because the element lives in that layer
// over the canvas.
//
// Every frame the camera is applied to the element as a CSS transform (written
// only when it changes), and an element outside the view is hidden. The mouse
// goes through it: the game reads the pointer itself, so the element must never
// take it.
export class ReactDomElement<P extends object>
    extends Phaser.GameObjects.DOMElement
{
    private readonly root: Root;
    private readonly component: ComponentType<P>;
    private readonly scalesWithZoom: boolean;
    private props: P;
    private renderedProps: P | null = null;
    private writtenTransform = "";
    // Starts hidden, since the element is created with `display: none`.
    private isHidden = true;
    private readonly element: HTMLElement;
    private positionSource: (() => WorldPoint) | null = null;
    private writtenZIndex = "";
    private readonly sizeObserver: ResizeObserver | null;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        component: ComponentType<P>,
        props: P,
        { scalesWithZoom }: Options
    ) {
        super(scene, x, y);
        this.component = component;
        this.props = props;
        this.scalesWithZoom = scalesWithZoom;

        this.element = document.createElement("aside");
        this.setElement(this.element);
        this.pointerEvents = "none";
        this.element.style.display = "none";
        this.element.style.width = "max-content";
        this.element.style.pointerEvents = "none";
        this.root = createRoot(this.element);

        // The width depends on the name, so it is read again when it changes.
        // Without it the element would sit off center until the next frame.
        // An element with `display: none` measures as 0, and that is not its
        // size, so it is not taken.
        this.sizeObserver = this.createSizeObserver();
        this.sizeObserver?.observe(this.element);

        // The renderers of a DOM element only write its CSS, so both hand the
        // work to `place`, which writes only what changed.
        const render = (
            _renderer: unknown,
            _src: unknown,
            camera: Phaser.Cameras.Scene2D.Camera
        ) => this.place(camera as CameraWithMatrix);
        Object.assign(this, { renderWebGL: render, renderCanvas: render });

        scene.add.existing(this);
        this.draw();
    }

    // Merges new props and draws again, only when one of them changed.
    setProps(props: Partial<P>): this {
        this.props = { ...this.props, ...props };
        this.draw();
        return this;
    }

    // The origin the element is laid out around, also in the CSS.
    setOrigin(x: number, y?: number): this {
        super.setOrigin(x, y);
        this.element.style.transformOrigin = `${100 * this.originX}% ${100 * this.originY}%`;
        return this;
    }

    // Where the element sits, asked at the moment it is drawn. A game object
    // moves in the physics step after the update of the scene, so a position
    // copied in the update is a frame behind the sprite it follows, and at a
    // high zoom the lag shows as a jolt. Read when drawing, it is the position
    // the sprite and the camera are drawn with.
    setPositionSource(source: (() => WorldPoint) | null): this {
        this.positionSource = source;
        return this;
    }

    setZIndex(zIndex: number): this {
        const value = String(zIndex);
        if (value === this.writtenZIndex) return this;

        this.writtenZIndex = value;
        this.element.style.zIndex = value;
        return this;
    }

    // Hidden is a CSS display, so the element keeps its React tree.
    setShown(isShown: boolean): this {
        this.setVisible(isShown);
        return this;
    }

    private draw(): void {
        if (
            this.renderedProps &&
            isShallowEqual(this.renderedProps, this.props)
        )
            return;

        this.renderedProps = this.props;
        this.root.render(createElement(this.component, this.props));
    }

    private createSizeObserver(): ResizeObserver | null {
        if (typeof ResizeObserver === "undefined") return null;

        return new ResizeObserver(() => {
            if (this.element.clientWidth > 0) this.updateSize();
        });
    }

    // Called by Phaser each time the element is rendered, with the camera.
    private place(camera: CameraWithMatrix): void {
        const node = this.element;

        if (!this.visible) {
            this.hide();
            return;
        }

        if (this.positionSource) {
            const { x, y } = this.positionSource();
            this.setPosition(x, y);
        }

        const { matrix, scrollX, scrollY, zoom, worldView } = camera;
        // Out of view even with the largest size the zoom can give it. The size
        // is the last one measured, which is enough to tell.
        const reach = Math.max(this.width, this.height) / Math.min(zoom, 1);
        const isOutOfView =
            this.x + reach < worldView.x ||
            this.x - reach > worldView.right ||
            this.y + reach < worldView.y ||
            this.y - reach > worldView.bottom + this.height;
        if (isOutOfView) {
            this.hide();
            return;
        }

        if (this.isHidden) {
            this.isHidden = false;
            node.style.display = "block";
            // Measured now, since it was not while it was hidden: with the old
            // size the element is drawn off center for a frame.
            this.updateSize();
        }

        const transform = computeDomTransform({
            camera: matrix,
            scroll: { x: scrollX, y: scrollY },
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            origin: { x: this.originX, y: this.originY },
            scale: this.scalesWithZoom ? 1 : getCounterZoomScale(zoom),
            roundToPixel: camera.renderRoundPixels,
        });
        if (transform === this.writtenTransform) return;

        this.writtenTransform = transform;
        node.style.transform = transform;
    }

    private hide(): void {
        if (this.isHidden) return;

        this.isHidden = true;
        this.element.style.display = "none";
    }

    destroy(fromScene?: boolean): void {
        // Phaser clears the scene of a destroyed object, and the display list
        // can destroy it again when the scene shuts down.
        if (!this.scene) return;

        this.sizeObserver?.disconnect();
        // Unmounting inside a render pass of Phaser is not allowed by React,
        // so it waits for the end of the task.
        const { root } = this;
        queueMicrotask(() => {
            try {
                root.unmount();
            } catch {
                // The tree is gone either way.
            }
        });
        super.destroy(fromScene);
    }
}
