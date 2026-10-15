import {
    ROOM_CROSS_DIRECTIONS,
    ROOM_DOOR_STATES,
    type RoomCrossDirection,
} from "@standin/contracts";
import { ROOM_DOOR_NEAR_REACH_PX } from "@/features/game/consts/room-door";
import type {
    GameRoom,
    GameRoomDoor,
    RoomDoorStates,
    RoomEntitlements,
} from "@/features/game/types/room";
import { findNearLockedRoom } from "@/features/game/utils/findNearLockedRoom";
import { getCrossing } from "@/features/game/utils/getCrossing";
import { getRoomAt } from "@/features/game/utils/getRoomAt";
import { isWithinReach } from "@/features/game/utils/isWithinReach";

// Reports what the avatar does around the rooms, and decides nothing: the
// server owns the state of the doors. It tells when the avatar changes side of
// a room (in or out) and when it steps onto the cell of a door of a closed
// room, once per entry into the cell. The position is read every frame.
export type RoomDoorPlayer = { x: number; y: number };

export type RoomDoorPort = {
    // The avatar is inside a room without having crossed into it: it spawned
    // or loaded there. The server only learns it, no door state changes.
    onPresent: (roomKey: string) => void;
    onCrossed: (roomKey: string, direction: RoomCrossDirection) => void;
    onStepOnDoor: (roomKey: string) => void;
    // The avatar came near the door of a locked room it may not enter (the
    // key), or stopped being near (null). Called only on a change.
    onNearLockedDoor?: (roomKey: string | null) => void;
};

export class RoomDoorController {
    private readonly player: RoomDoorPlayer;
    private readonly port: RoomDoorPort;
    private rooms: GameRoom[] = [];
    private doors: GameRoomDoor[] = [];
    private states: RoomDoorStates = new Map();
    // Null until the first frame reads where the avatar is, so spawning or
    // loading inside a room is not a crossing.
    private known = false;
    private roomKey: string | null = null;
    private readonly doorsUnderPlayer = new Set<string>();
    private entitlements: RoomEntitlements = {
        all: false,
        roomKeys: new Set(),
    };
    private nearRoomKey: string | null = null;

    constructor(player: RoomDoorPlayer, port: RoomDoorPort) {
        this.player = player;
        this.port = port;
    }

    // A new list of rooms: the side the avatar is on is read again without
    // reporting, since the rooms moved and not the avatar.
    setRooms(rooms: GameRoom[]): void {
        this.rooms = rooms;
        this.known = false;
    }

    setDoors(doors: GameRoomDoor[]): void {
        this.doors = doors;
        const ids = new Set(doors.map((door) => door.id));
        this.doorsUnderPlayer.forEach((id) => {
            if (!ids.has(id)) this.doorsUnderPlayer.delete(id);
        });
    }

    setStates(states: RoomDoorStates): void {
        this.states = states;
    }

    // The locked rooms the avatar may walk into, which are never "near".
    setEntitlements(entitlements: RoomEntitlements): void {
        this.entitlements = entitlements;
    }

    // Tells the server the avatar is in its room, for when the server forgot
    // it (a reconnect gives the socket a new id).
    reportPresence(): void {
        if (this.roomKey !== null) this.port.onPresent(this.roomKey);
    }

    // The key of the room the avatar is in, or null.
    getRoomKey(): string | null {
        return this.roomKey;
    }

    // The avatar is inside a room that is locked. The server lets it walk out
    // (leaving unlocks and opens the room), but the solid door would stop it,
    // so the integration turns the bodies of that room off for the local
    // avatar while this is true: skip the collider between the player and the
    // `RoomDoorColliders` group, or call `RoomDoorColliders.setStates` with the
    // room read as not locked, and put it back once this turns false.
    isLeavingAllowed(): boolean {
        if (this.roomKey === null) return false;

        return this.states.get(this.roomKey) === ROOM_DOOR_STATES.LOCKED;
    }

    update(): void {
        this.updateSide();
        this.updateDoorSteps();
        this.updateNearLockedDoor();
    }

    private updateNearLockedDoor(): void {
        const near = findNearLockedRoom({
            doors: this.doors,
            point: this.player,
            states: this.states,
            entitlements: this.entitlements,
            insideRoomKey: this.roomKey,
            reach: ROOM_DOOR_NEAR_REACH_PX,
        });
        if (near === this.nearRoomKey) return;

        this.nearRoomKey = near;
        this.port.onNearLockedDoor?.(near);
    }

    private updateSide(): void {
        const current = getRoomAt(this.rooms, this.player)?.key ?? null;
        const previous = this.roomKey;
        this.roomKey = current;

        if (!this.known) {
            this.known = true;
            this.reportPresence();
            return;
        }

        if (previous !== null && previous !== current) {
            this.port.onCrossed(previous, ROOM_CROSS_DIRECTIONS.OUT);
        }
        if (current !== null && getCrossing(previous, current)) {
            this.port.onCrossed(current, ROOM_CROSS_DIRECTIONS.IN);
        }
    }

    private updateDoorSteps(): void {
        for (const door of this.doors) {
            const isOn = isWithinReach(door, this.player, 0);
            const wasOn = this.doorsUnderPlayer.has(door.id);

            if (!isOn) {
                this.doorsUnderPlayer.delete(door.id);
                continue;
            }
            if (wasOn) continue;

            this.doorsUnderPlayer.add(door.id);
            if (this.states.get(door.roomKey) === ROOM_DOOR_STATES.CLOSED) {
                this.port.onStepOnDoor(door.roomKey);
            }
        }
    }
}
