import type { TileRect } from "@/features/editor/types/tile-rect";
import { isSameTileRect } from "@/features/editor/utils/isSameTileRect";

type Listener = () => void;

// The rectangle of the frame of an area, outside React. The scene draws it and
// drags it, and React reads it to capture the area and to know it changed. A
// set to the same rectangle notifies no one.
export class FrameStore {
    private rect: TileRect;

    private readonly listeners = new Set<Listener>();

    constructor(rect: TileRect) {
        this.rect = rect;
    }

    getRect = (): TileRect => this.rect;

    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    setRect = (rect: TileRect): void => {
        if (isSameTileRect(this.rect, rect)) return;
        this.rect = rect;
        this.listeners.forEach((listener) => listener());
    };
}

export const createFrameStore = (rect: TileRect): FrameStore =>
    new FrameStore(rect);
