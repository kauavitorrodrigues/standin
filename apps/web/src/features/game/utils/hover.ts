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

type HoverCamera = Pick<Phaser.Cameras.Scene2D.Camera, "worldView" | "zoom">;

export const toHoverState = (
    target: HoverTarget,
    camera: HoverCamera
): HoverState =>
    writeHoverState(target, camera, {
        id: target.id,
        screen: { x: 0, y: 0, width: 0, height: 0 },
    });

// Writes the state of a target into one the caller keeps, so a frame that
// finds nothing new builds nothing. The caller copies it (copyHoverState) only
// when it is about to hand it out.
export const writeHoverState = (
    target: HoverTarget,
    camera: HoverCamera,
    out: HoverState
): HoverState => {
    const { x, y, width, height } = target.bounds;

    out.id = target.id;
    if (target.label === undefined) {
        delete out.label;
    } else {
        out.label = target.label;
    }
    out.screen.x = Math.round((x - camera.worldView.x) * camera.zoom);
    out.screen.y = Math.round((y - camera.worldView.y) * camera.zoom);
    out.screen.width = Math.round(width * camera.zoom);
    out.screen.height = Math.round(height * camera.zoom);
    return out;
};

export const copyHoverState = (state: HoverState): HoverState => ({
    id: state.id,
    ...(state.label === undefined ? {} : { label: state.label }),
    screen: { ...state.screen },
});

// A plain loop, since the controllers look targets up by id every frame.
export const findTargetById = (
    targets: readonly HoverTarget[],
    id: string | null
): HoverTarget | null => {
    if (id === null) return null;

    for (let index = 0; index < targets.length; index += 1) {
        const target = targets[index]!;
        if (target.id === id) return target;
    }
    return null;
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
