import type Phaser from "phaser";
import type { HoverState, HoverTarget } from "@/features/game/types/hover";
import type { PlacedRect } from "@/features/game/utils/placed";

type Point = { x: number; y: number };

const contains = ({ x, y, width, height }: PlacedRect, point: Point) =>
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height;

// The last target of the list wins when two overlap, since it draws last.
export const findHoveredTarget = (
    targets: readonly HoverTarget[],
    point: Point
): HoverTarget | null => {
    for (let index = targets.length - 1; index >= 0; index--) {
        const target = targets[index]!;
        if (contains(target.bounds, point)) return target;
    }
    return null;
};

export const toHoverState = (
    target: HoverTarget,
    camera: Pick<Phaser.Cameras.Scene2D.Camera, "worldView" | "zoom">
): HoverState => {
    const { x, y, width, height } = target.bounds;

    return {
        id: target.id,
        screen: {
            x: Math.round((x - camera.worldView.x) * camera.zoom),
            y: Math.round((y - camera.worldView.y) * camera.zoom),
            width: Math.round(width * camera.zoom),
            height: Math.round(height * camera.zoom),
        },
    };
};

export const isSameHover = (
    a: HoverState | null,
    b: HoverState | null
): boolean =>
    a?.id === b?.id &&
    a?.screen.x === b?.screen.x &&
    a?.screen.y === b?.screen.y &&
    a?.screen.width === b?.screen.width &&
    a?.screen.height === b?.screen.height;

// The page pins a target while the mouse is on its card, since the card is
// over the canvas and the canvas stops seeing the pointer.
export const getHoverPinEvent = (event: string): string => `${event}:pin`;

export const getHoverClickEvent = (event: string): string => `${event}:click`;

export const bindHoverClickSubscription = (
    game: Phaser.Game,
    event: string,
    listener: (id: string | null) => void
): (() => void) => {
    const clickEvent = getHoverClickEvent(event);
    game.events.on(clickEvent, listener);
    return () => {
        game.events.off(clickEvent, listener);
    };
};

// A selected target keeps its outline whatever the mouse does, until the page
// selects none. The hover only outlines while the mouse is on a target.
export const getHoverSelectEvent = (event: string): string => `${event}:select`;

export const selectHover = (
    game: Phaser.Game,
    event: string,
    id: string | null
): void => {
    game.events.emit(getHoverSelectEvent(event), id);
};

// The screen position of the selected target, which the page follows to keep
// a card over it while the camera moves.
export const getSelectedStateEvent = (event: string): string =>
    `${event}:selected-state`;

export const bindSelectedSubscription = (
    game: Phaser.Game,
    event: string,
    listener: (state: HoverState | null) => void
): (() => void) => {
    const selectedEvent = getSelectedStateEvent(event);
    game.events.on(selectedEvent, listener);
    return () => {
        game.events.off(selectedEvent, listener);
    };
};

export const pinHover = (
    game: Phaser.Game,
    event: string,
    id: string | null
): void => {
    game.events.emit(getHoverPinEvent(event), id);
};

export const bindHoverSubscription = (
    game: Phaser.Game,
    event: string,
    listener: (hover: HoverState | null) => void
): (() => void) => {
    game.events.on(event, listener);
    return () => {
        game.events.off(event, listener);
    };
};
