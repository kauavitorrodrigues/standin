import type { RoomDoorState } from "@standin/contracts";
import {
    ROOM_DOOR_FRAMES,
    ROOM_DOOR_PADLOCK,
} from "@/features/game/consts/room-door";
import type { RoomDoorStates } from "@/features/game/types/room";
import { getDoorVisualAction } from "@/features/game/utils/getDoorVisualAction";
import { buildAssetAnimationKey } from "@/features/game/utils/map";

// The parts of a sprite the view drives, so it can run against a fake.
export type DoorSprite = {
    depth: number;
    anims: { stop: () => unknown };
    setFrame: (frame: number) => unknown;
    play: (config: { key: string; repeat: number }) => unknown;
    playReverse: (config: { key: string; repeat: number }) => unknown;
    getCenter: () => { x: number; y: number };
};

// Gives the sprite the object renderer created for a placed door.
export type DoorSpriteProvider = {
    getSprite: (id: string) => DoorSprite | undefined;
};

// The parts of the padlock image the view drives.
type PadlockImage = {
    setOrigin: (x: number, y: number) => unknown;
    setScale: (scale: number) => unknown;
    setDepth: (depth: number) => unknown;
    setPosition: (x: number, y: number) => unknown;
    setVisible: (visible: boolean) => unknown;
    destroy: () => unknown;
};

export type DoorViewScene = {
    add: { image: (x: number, y: number, texture: string) => PadlockImage };
};

// A placed door and the asset animation that drives it.
export type RoomDoorViewDoor = {
    id: string;
    roomKey: string;
    assetId: string;
    // `animation.frameCount` of the asset, 0 or 1 when it has no animation.
    frameCount: number;
};

type DoorEntry = {
    sprite: DoorSprite;
    state: RoomDoorState;
    padlock?: PadlockImage;
};

/**
 * Draws the state of the doors over the sprites the object renderer made.
 * Open is the last frame of the asset animation and closed is frame 0, played
 * forward to open and backward to close, once. The first state a door gets
 * snaps to its frame. Locked looks closed plus a padlock drawn with
 * an image over the door.
 *
 * A door whose asset has no animation (frameCount < 2) keeps its sprite as it
 * is, since hiding it or stacking a closed overlay could erase the door from
 * the map. Only the padlock still shows when it is locked.
 */
export class RoomDoorView {
    private doors: RoomDoorViewDoor[] = [];
    private readonly entries = new Map<string, DoorEntry>();
    private readonly scene: DoorViewScene;
    private readonly sprites: DoorSpriteProvider;

    constructor(scene: DoorViewScene, sprites: DoorSpriteProvider) {
        this.scene = scene;
        this.sprites = sprites;
    }

    // Replaces the doors of the map. Call it when the placed objects change.
    setDoors(doors: RoomDoorViewDoor[]): void {
        this.doors = doors;
        const ids = new Set(doors.map((door) => door.id));
        this.entries.forEach((entry, id) => {
            if (ids.has(id)) return;
            entry.padlock?.destroy();
            this.entries.delete(id);
        });
    }

    // Shows the state of every door. Call it on each `room:state` and after
    // the sprites were rebuilt.
    apply(states: RoomDoorStates): void {
        for (const door of this.doors) {
            const next = states.get(door.roomKey);
            const sprite = this.sprites.getSprite(door.id);
            if (!next || !sprite) continue;
            this.applyDoor(door, sprite, next);
        }
    }

    destroy(): void {
        this.entries.forEach((entry) => entry.padlock?.destroy());
        this.entries.clear();
        this.doors = [];
    }

    private applyDoor(
        door: RoomDoorViewDoor,
        sprite: DoorSprite,
        next: RoomDoorState
    ): void {
        const entry = this.entries.get(door.id);
        // A rebuilt sprite starts over from its first frame, so it snaps.
        const previous = entry?.sprite === sprite ? entry.state : undefined;
        this.runAction(door, sprite, getDoorVisualAction(previous, next));

        const padlock = this.syncPadlock(entry?.padlock, sprite, next);
        this.entries.set(door.id, { sprite, state: next, padlock });
    }

    private runAction(
        door: RoomDoorViewDoor,
        sprite: DoorSprite,
        action: ReturnType<typeof getDoorVisualAction>
    ): void {
        if (door.frameCount < ROOM_DOOR_FRAMES.MIN_ANIMATED_COUNT) return;
        const lastFrame = door.frameCount - 1;
        const config = { key: buildAssetAnimationKey(door.assetId), repeat: 0 };

        switch (action) {
            case "snap-open":
                sprite.anims.stop();
                sprite.setFrame(lastFrame);
                return;
            case "snap-closed":
                sprite.anims.stop();
                sprite.setFrame(ROOM_DOOR_FRAMES.CLOSED);
                return;
            case "animate-open":
                sprite.play(config);
                return;
            case "animate-closed":
                sprite.playReverse(config);
                return;
            case "none":
                return;
        }
    }

    // Keeps the padlock only while locked and centered on the door.
    private syncPadlock(
        padlock: PadlockImage | undefined,
        sprite: DoorSprite,
        state: RoomDoorState
    ): PadlockImage | undefined {
        if (state !== "locked") {
            padlock?.setVisible(false);
            return padlock;
        }
        const image = padlock ?? this.createPadlock();
        const center = sprite.getCenter();
        image.setPosition(center.x, center.y);
        image.setDepth(sprite.depth + ROOM_DOOR_PADLOCK.DEPTH_OFFSET);
        image.setVisible(true);
        return image;
    }

    // The origin is the center of the visible padlock, since the texture has
    // transparent margin around it.
    private createPadlock(): PadlockImage {
        const p = ROOM_DOOR_PADLOCK;
        const image = this.scene.add.image(0, 0, p.TEXTURE_KEY);
        image.setOrigin(p.ORIGIN_X, p.ORIGIN_Y);
        image.setScale(p.SCALE);
        return image;
    }
}
