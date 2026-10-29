import Phaser from "phaser";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
    NameTagOverlayView,
    type NameTagOverlayItem,
} from "@/features/game/components/NameTagOverlayView";
import type { NameTagPillProps } from "@/features/game/components/NameTagPill";
import { NAME_TAG } from "@/features/game/consts/name-tag";
import {
    computeDomTransform,
    getCounterZoomScale,
    type Matrix2D,
} from "@/features/game/utils/computeDomTransform";

type CameraWithMatrix = Phaser.Cameras.Scene2D.Camera & {
    matrix: Matrix2D;
    renderRoundPixels: boolean;
};

type WorldPoint = { x: number; y: number };

// One tag of the overlay. The wrapper is the node the overlay moves.
type Entry = {
    id: number;
    node: HTMLElement;
    props: NameTagPillProps;
    source: () => WorldPoint;
    isShown: boolean;
    isHidden: boolean;
    zIndex: string;
    transform: string;
    // What the transform was last written from, to skip the work when neither
    // the camera nor the avatar moved.
    placedKey: string;
    width: number;
    height: number;
    observer: ResizeObserver | null;
};

type AddParams = {
    props: NameTagPillProps;
    // Where the bottom center of the tag goes, asked when the frame is drawn.
    source: () => WorldPoint;
};

const overlays = new WeakMap<Phaser.Scene, NameTagOverlay>();
// The overlays with a mounted root, to count them from the dev console.
const mounted = new Set<NameTagOverlay>();

// How many React roots and name tags are alive. Dev builds expose it to check
// that the tags share a single root (see Engine.ts).
export const getNameTagOverlayStats = () => ({
    roots: mounted.size,
    tags: [...mounted].reduce((sum, overlay) => sum + overlay.tagCount, 0),
});

const isShallowEqual = (a: object, b: object): boolean => {
    const keys = Object.keys(a) as (keyof typeof a)[];
    return (
        keys.length === Object.keys(b).length &&
        keys.every((key) => a[key] === b[key as keyof typeof b])
    );
};

// Every name tag of a scene in a single React root, instead of a root per
// avatar. Drawing the tags inside the canvas would be the alternative, and a
// DOM overlay is the accepted stand-in as long as it is one root.
//
// The content (name, dot, photo, typing icon) is drawn by React at most every
// `OVERLAY_RENDER_INTERVAL_MS`, and only when a tag changed. The wrappers are
// placed without React, right after each frame is drawn, by a CSS transform that
// is written only when the camera or the avatar moved. The scene RENDER event
// comes after camera.preRender, so the scroll, matrix and world view read there
// are the ones the sprites were just drawn with, and the tag is not a frame
// behind the camera. The
// mouse goes through it: the game reads the pointer itself.
export class NameTagOverlay {
    private readonly root: Root;
    // Holds the wrappers. It is not the container of the root, because React
    // clears the container the first time it draws.
    private readonly layer: HTMLElement;
    private readonly host: HTMLElement;
    private readonly entries = new Map<number, Entry>();
    private nextId = 1;
    private isDirty = false;
    private lastRenderAt = Number.NEGATIVE_INFINITY;
    private timer: ReturnType<typeof setTimeout> | null = null;
    private isDestroyed = false;

    // The overlay of the scene, made the first time it is asked for and
    // destroyed with the scene.
    static forScene(scene: Phaser.Scene): NameTagOverlay {
        const existing = overlays.get(scene);
        if (existing) return existing;

        const overlay = new NameTagOverlay(scene);
        overlays.set(scene, overlay);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            overlays.delete(scene);
            overlay.destroy();
        });
        return overlay;
    }

    private readonly scene: Phaser.Scene;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        // `contents` keeps the wrappers in the stacking context of the game,
        // so their z-index still orders them against the other DOM elements.
        this.layer = document.createElement("div");
        this.layer.style.display = "contents";
        this.host = document.createElement("div");
        this.host.style.display = "none";
        const parent = scene.game.domContainer ?? document.body;
        parent.appendChild(this.layer);
        parent.appendChild(this.host);
        this.root = createRoot(this.host);
        mounted.add(this);
        scene.events.on(Phaser.Scenes.Events.RENDER, this.placeAll, this);
    }

    get tagCount(): number {
        return this.entries.size;
    }

    add({ props, source }: AddParams): number {
        const id = this.nextId++;
        const node = document.createElement("aside");
        node.style.position = "absolute";
        node.style.left = "0";
        node.style.top = "0";
        node.style.display = "none";
        node.style.width = "max-content";
        node.style.pointerEvents = "none";
        node.style.transformOrigin = "50% 100%";
        this.layer.appendChild(node);

        const entry: Entry = {
            id,
            node,
            props,
            source,
            isShown: false,
            isHidden: true,
            zIndex: "",
            transform: "",
            placedKey: "",
            width: 0,
            height: 0,
            observer: this.createObserver(id),
        };
        entry.observer?.observe(node);
        this.entries.set(id, entry);
        this.markDirty();
        return id;
    }

    remove(id: number): void {
        const entry = this.entries.get(id);
        if (!entry) return;

        entry.observer?.disconnect();
        entry.node.remove();
        this.entries.delete(id);
        this.markDirty();
    }

    setProps(id: number, props: Partial<NameTagPillProps>): void {
        const entry = this.entries.get(id);
        if (!entry) return;

        const next = { ...entry.props, ...props };
        if (isShallowEqual(entry.props, next)) return;

        entry.props = next;
        this.markDirty();
    }

    setShown(id: number, isShown: boolean): void {
        const entry = this.entries.get(id);
        if (!entry) return;

        entry.isShown = isShown;
        if (!isShown) this.hide(entry);
    }

    setZIndex(id: number, zIndex: number): void {
        const entry = this.entries.get(id);
        if (!entry) return;

        const value = String(zIndex);
        if (value === entry.zIndex) return;

        entry.zIndex = value;
        entry.node.style.zIndex = value;
    }

    destroy(): void {
        if (this.isDestroyed) return;

        this.isDestroyed = true;
        mounted.delete(this);
        this.scene.events?.off(
            Phaser.Scenes.Events.RENDER,
            this.placeAll,
            this
        );
        if (this.timer !== null) clearTimeout(this.timer);
        this.entries.forEach((entry) => entry.observer?.disconnect());
        this.entries.clear();
        // Unmounting inside a render pass of Phaser is not allowed by React,
        // so it waits for the end of the task.
        const { root, host, layer } = this;
        queueMicrotask(() => {
            try {
                root.unmount();
            } catch {
                // The tree is gone either way.
            }
            host.remove();
            layer.remove();
        });
    }

    // The width depends on the name, so it is read again when it changes.
    // A node with `display: none` measures as 0, and that is not its size.
    private createObserver(id: number): ResizeObserver | null {
        if (typeof ResizeObserver === "undefined") return null;

        return new ResizeObserver(() => {
            const entry = this.entries.get(id);
            if (entry) this.measure(entry);
        });
    }

    private measure(entry: Entry): void {
        if (entry.node.clientWidth === 0) return;

        entry.width = entry.node.clientWidth;
        entry.height = entry.node.clientHeight;
        entry.placedKey = "";
    }

    // Draws the list at once if the last draw is old enough, and otherwise
    // when the interval since it is over.
    private markDirty(): void {
        this.isDirty = true;
        if (this.timer !== null || this.isDestroyed) return;

        const wait = Math.max(
            0,
            this.lastRenderAt + NAME_TAG.OVERLAY_RENDER_INTERVAL_MS - Date.now()
        );
        this.timer = setTimeout(() => {
            this.timer = null;
            this.flush();
        }, wait);
    }

    private flush(): void {
        if (!this.isDirty || this.isDestroyed) return;

        this.isDirty = false;
        this.lastRenderAt = Date.now();
        const items: NameTagOverlayItem[] = [...this.entries.values()].map(
            ({ id, node, props }) => ({ id, node, props })
        );
        this.root.render(createElement(NameTagOverlayView, { items }));
    }

    // Called after the cameras rendered, so the camera state is the one the
    // sprites were drawn with in this frame.
    private placeAll(): void {
        const camera = this.scene.cameras.main as CameraWithMatrix;
        this.entries.forEach((entry) => this.place(entry, camera));
    }

    private place(entry: Entry, camera: CameraWithMatrix): void {
        if (!entry.isShown) return;

        const { x, y } = entry.source();
        const { matrix, scrollX, scrollY, zoom, worldView } = camera;
        const key = `${x},${y},${scrollX},${scrollY},${zoom},${matrix.e},${matrix.f}`;
        if (key === entry.placedKey && !entry.isHidden) return;

        // Out of view even with the largest size the zoom can give it. The size
        // is the last one measured, which is enough to tell.
        const reach = Math.max(entry.width, entry.height) / Math.min(zoom, 1);
        const isOutOfView =
            x + reach < worldView.x ||
            x - reach > worldView.right ||
            y + reach < worldView.y ||
            y - reach > worldView.bottom + entry.height;
        if (isOutOfView) {
            this.hide(entry);
            entry.placedKey = "";
            return;
        }

        if (entry.isHidden) {
            entry.isHidden = false;
            entry.node.style.display = "block";
            // Measured now, since it was not while it was hidden.
            this.measure(entry);
        }

        entry.placedKey = key;
        const transform = computeDomTransform({
            camera: matrix,
            scroll: { x: scrollX, y: scrollY },
            position: { x, y },
            size: { width: entry.width, height: entry.height },
            origin: { x: 0.5, y: 1 },
            scale: NAME_TAG.SCALES_WITH_ZOOM ? 1 : getCounterZoomScale(zoom),
            roundToPixel: camera.renderRoundPixels,
        });
        if (transform === entry.transform) return;

        entry.transform = transform;
        entry.node.style.transform = transform;
    }

    private hide(entry: Entry): void {
        if (entry.isHidden) return;

        entry.isHidden = true;
        entry.node.style.display = "none";
    }
}
