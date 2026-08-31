import Phaser from "phaser";
import {
    MAP_OBJECT_ACTIONS,
    type MapObjectAction,
    type MapObjectPropertiesSchemaType,
} from "@standin/contracts";
import {
    EDITABLE_ELEMENT_TAG_NAMES,
    FOCUS_TRACKING_EVENTS,
    PLAYER_MOVEMENT_KEY_BINDINGS,
    ZERO_MAGNITUDE,
    ZERO_VELOCITY,
} from "@/features/game/consts/player";
import { OBJECT_DATA_KEYS } from "@/features/game/consts/object-data-keys";
import { INTERACTION_PROMPT_LABELS } from "@/features/game/consts/interaction";
import { getMapScene } from "@/features/game/utils/map";
import { getMapCameraController } from "@/features/game/utils/camera";
import type { Player } from "@/features/game/lib/Player";
import type { InteractionController } from "@/features/game/lib/InteractionController";

export type MovementKeys = Record<
    keyof typeof PLAYER_MOVEMENT_KEY_BINDINGS,
    Phaser.Input.Keyboard.Key[]
>;

export const resolveMovementKeys = (scene: Phaser.Scene): MovementKeys => {
    const keyboard = scene.input.keyboard;

    const addKeys = (codes: readonly number[]): Phaser.Input.Keyboard.Key[] =>
        codes
            .map((code) => keyboard?.addKey(code))
            .filter(
                (key): key is Phaser.Input.Keyboard.Key => key !== undefined
            );

    return {
        UP: addKeys(PLAYER_MOVEMENT_KEY_BINDINGS.UP),
        DOWN: addKeys(PLAYER_MOVEMENT_KEY_BINDINGS.DOWN),
        LEFT: addKeys(PLAYER_MOVEMENT_KEY_BINDINGS.LEFT),
        RIGHT: addKeys(PLAYER_MOVEMENT_KEY_BINDINGS.RIGHT),
    };
};

export const isAnyKeyDown = (keys: Phaser.Input.Keyboard.Key[]): boolean =>
    keys.some((key) => key.isDown);

const isEditableElement = (element: Element | null): boolean => {
    if (!element) return false;
    if (
        EDITABLE_ELEMENT_TAG_NAMES.includes(
            element.tagName as (typeof EDITABLE_ELEMENT_TAG_NAMES)[number]
        )
    ) {
        return true;
    }

    return (element as HTMLElement).isContentEditable;
};

/**
 * The game's keyboard plugin listens on the whole window, so typing into an
 * unrelated input elsewhere on the page (e.g. the space sidebar) would also
 * drive player movement/interaction. This disables it while any editable
 * element has focus.
 */
export const bindKeyboardFocusGuard = (scene: Phaser.Scene): void => {
    const keyboard = scene.input.keyboard;
    if (!keyboard) return;

    const syncEnabled = (): void => {
        keyboard.enabled = !isEditableElement(document.activeElement);
    };

    document.addEventListener(FOCUS_TRACKING_EVENTS.IN, syncEnabled);
    document.addEventListener(FOCUS_TRACKING_EVENTS.OUT, syncEnabled);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        document.removeEventListener(FOCUS_TRACKING_EVENTS.IN, syncEnabled);
        document.removeEventListener(FOCUS_TRACKING_EVENTS.OUT, syncEnabled);
    });
};

export const resolveAxis = (
    negativeActive: boolean,
    positiveActive: boolean
): number => Number(positiveActive) - Number(negativeActive);

export const normalizeToSpeed = (
    x: number,
    y: number,
    speed: number
): { x: number; y: number } => {
    const magnitude = Math.hypot(x, y);
    if (magnitude === ZERO_MAGNITUDE) return ZERO_VELOCITY;

    return { x: (x / magnitude) * speed, y: (y / magnitude) * speed };
};

export type InteractableMapObjectProperties = Extract<
    MapObjectPropertiesSchemaType,
    { interactable: true }
>;

export type ActionTarget = { x: number; y: number };

export const resolveActionTarget = (
    properties: InteractableMapObjectProperties
): ActionTarget => {
    switch (properties.action) {
    case MAP_OBJECT_ACTIONS.SIT:
        return { x: properties.seatX, y: properties.seatY };
    case MAP_OBJECT_ACTIONS.TELEPORT:
        return { x: properties.targetX, y: properties.targetY };
    }
};

export const resolveInteractionPromptLabel = (
    action: MapObjectAction
): string => {
    switch (action) {
    case MAP_OBJECT_ACTIONS.SIT:
        return INTERACTION_PROMPT_LABELS.SIT;
    case MAP_OBJECT_ACTIONS.TELEPORT:
        return INTERACTION_PROMPT_LABELS.TELEPORT;
    }
};

export const getPlayer = (game: Phaser.Game): Player | null =>
    getMapScene(game)?.player ?? null;

export const bindPlayerCollision = (
    scene: Phaser.Scene,
    player: Player,
    solidGroup: Phaser.Physics.Arcade.StaticGroup
): void => {
    scene.physics.add.collider(player.gameObject, solidGroup);
};

export const bindPlayerInteractions = (
    scene: Phaser.Scene,
    player: Player,
    interactableGroup: Phaser.Physics.Arcade.StaticGroup,
    interactionController: InteractionController
): void => {
    scene.physics.add.overlap(
        player.gameObject,
        interactableGroup,
        (_playerObject, zoneObject) => {
            const properties = (zoneObject as Phaser.GameObjects.Zone).getData(
                OBJECT_DATA_KEYS.PROPERTIES
            ) as InteractableMapObjectProperties;

            interactionController.registerOverlap(properties);
        }
    );
};

export const focusOnPlayer = (game: Phaser.Game): void => {
    const player = getPlayer(game);
    if (!player) return;

    getMapCameraController(game)?.recenterOn(player.gameObject);
};