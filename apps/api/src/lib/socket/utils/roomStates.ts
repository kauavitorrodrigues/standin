import { ROOM_CROSS_DIRECTIONS, ROOM_DOOR_STATES } from "@standin/contracts";
import type { RoomCrossDirection, RoomDoorState } from "@standin/contracts";

type Room = {
    state: RoomDoorState;
    inside: Set<string>;
    // Users let in by someone inside, kept by user id so a refresh keeps it.
    // Lives as long as the meeting, which ends when nobody is inside.
    accepted: Set<string>;
    // Users asking to join, with the socket that asked.
    pending: Map<string, string>;
};

// Tells a pending request is over. `notify` are the sockets inside to tell.
export type JoinCancel = {
    roomKey: string;
    userId: string;
    notify: string[];
};

// What a store call left to emit besides the room state: requests to cancel
// and users whose accepted rooms were cleared (they get new entitlements).
export type JoinEffects = { cancelled: JoinCancel[]; lostUsers: string[] };

export type JoinRequested = { notify: string[] };

export type JoinAnswered = {
    requesterSocketId: string;
    notify: string[];
};

export type RoomEntitlements = { all: boolean; roomKeys: string[] };

export type RoomRemoval = {
    changes: RoomStateChange[];
    effects: JoinEffects;
};

const noEffects = (): JoinEffects => ({ cancelled: [], lostUsers: [] });

// `accepted` false means the sender must be told the current state alone.
// `changed` true means the whole space must be told the new state.
export type RoomChange = {
    accepted: boolean;
    changed: boolean;
    state: RoomDoorState;
    effects: JoinEffects;
};

export type RoomStateChange = { roomKey: string; state: RoomDoorState };

// The authoritative door state of every room, per space. Lives in memory, like
// the seats: a restart opens every room again. The server never knows where an
// avatar is, only who crossed in and not yet out.
const spaces = new Map<string, Map<string, Room>>();

// The sockets of each space that belong to the owner of the space.
const owners = new Map<string, Set<string>>();

const getRoom = (spaceId: string, roomKey: string): Room => {
    let rooms = spaces.get(spaceId);
    if (!rooms) {
        rooms = new Map();
        spaces.set(spaceId, rooms);
    }
    let room = rooms.get(roomKey);
    if (!room) {
        room = {
            state: ROOM_DOOR_STATES.OPEN,
            inside: new Set(),
            accepted: new Set(),
            pending: new Map(),
        };
        rooms.set(roomKey, room);
    }
    return room;
};

const moveTo = (
    room: Room,
    state: RoomDoorState,
    effects: JoinEffects = noEffects()
): RoomChange => {
    const changed = room.state !== state;
    room.state = state;
    return { accepted: true, changed, state, effects };
};

const refuse = (room: Room): RoomChange => ({
    accepted: false,
    changed: false,
    state: room.state,
    effects: noEffects(),
});

const cancelPending = (
    roomKey: string,
    room: Room,
    userId: string
): JoinCancel[] => {
    if (!room.pending.delete(userId)) return [];
    return [{ roomKey, userId, notify: [...room.inside] }];
};

// Nobody inside any more: the meeting is over, so the ones let in lose it and
// requests still waiting have nobody left to answer them.
const endMeetingIfEmpty = (room: Room, effects: JoinEffects) => {
    if (room.inside.size > 0) return;
    effects.lostUsers.push(...room.accepted);
    room.accepted.clear();
    room.pending.clear();
};

const isEntitled = (
    spaceId: string,
    room: Room,
    socketId: string,
    userId: string
) => owners.get(spaceId)?.has(socketId) === true || room.accepted.has(userId);

const enter = (
    roomKey: string,
    room: Room,
    socketId: string,
    userId: string
): JoinEffects => {
    room.inside.add(socketId);
    return { cancelled: cancelPending(roomKey, room, userId), lostUsers: [] };
};

const cross = (
    spaceId: string,
    roomKey: string,
    room: Room,
    socketId: string,
    userId: string,
    direction: RoomCrossDirection
): RoomChange => {
    switch (direction) {
        case ROOM_CROSS_DIRECTIONS.IN: {
            const locked = room.state === ROOM_DOOR_STATES.LOCKED;
            if (locked && !isEntitled(spaceId, room, socketId, userId)) {
                return refuse(room);
            }
            const effects = enter(roomKey, room, socketId, userId);
            // Whoever is let into a locked room does not unlock it.
            if (locked) return moveTo(room, ROOM_DOOR_STATES.LOCKED, effects);
            return moveTo(room, ROOM_DOOR_STATES.CLOSED, effects);
        }
        case ROOM_CROSS_DIRECTIONS.OUT: {
            const wasInside = room.inside.delete(socketId);
            // Leaving a locked room unlocks it, but only for who was inside.
            if (room.state === ROOM_DOOR_STATES.LOCKED && !wasInside) {
                return refuse(room);
            }
            const effects = noEffects();
            endMeetingIfEmpty(room, effects);
            return moveTo(room, ROOM_DOOR_STATES.OPEN, effects);
        }
    }
};

export const RoomStates = {
    cross(
        spaceId: string,
        roomKey: string,
        socketId: string,
        userId: string,
        direction: RoomCrossDirection
    ): RoomChange {
        const room = getRoom(spaceId, roomKey);
        return cross(spaceId, roomKey, room, socketId, userId, direction);
    },

    // Stepping on the cell of a closed door opens it.
    open(spaceId: string, roomKey: string): RoomChange {
        const room = getRoom(spaceId, roomKey);
        if (room.state !== ROOM_DOOR_STATES.CLOSED) return refuse(room);
        return moveTo(room, ROOM_DOOR_STATES.OPEN);
    },

    // An avatar that was already inside when it joined. Changes no state.
    present(
        spaceId: string,
        roomKey: string,
        socketId: string,
        userId: string
    ): RoomChange {
        const room = getRoom(spaceId, roomKey);
        const effects = enter(roomKey, room, socketId, userId);
        return { accepted: false, changed: false, state: room.state, effects };
    },

    lock(spaceId: string, roomKey: string, socketId: string): RoomChange {
        const room = getRoom(spaceId, roomKey);
        const canLock =
            room.inside.has(socketId) && room.state !== ROOM_DOOR_STATES.LOCKED;
        if (!canLock) return refuse(room);
        return moveTo(room, ROOM_DOOR_STATES.LOCKED);
    },

    unlock(spaceId: string, roomKey: string, socketId: string): RoomChange {
        const room = getRoom(spaceId, roomKey);
        const canUnlock =
            room.inside.has(socketId) && room.state === ROOM_DOOR_STATES.LOCKED;
        if (!canUnlock) return refuse(room);
        // Nobody is waiting for a door that is no longer locked.
        const cancelled = [...room.pending.keys()].flatMap((userId) =>
            cancelPending(roomKey, room, userId)
        );
        return moveTo(room, ROOM_DOOR_STATES.CLOSED, {
            cancelled,
            lostUsers: [],
        });
    },

    // Drops a socket from every room of the space. A locked room left with
    // nobody inside opens, so it is never locked forever. Returns the rooms
    // whose state changed and what to tell about the requests.
    // The private room each socket is inside right now, for who is in one.
    roomKeysBySocket(spaceId: string): Map<string, string> {
        const bySocket = new Map<string, string>();
        spaces.get(spaceId)?.forEach((room, roomKey) => {
            room.inside.forEach((socketId) => bySocket.set(socketId, roomKey));
        });
        return bySocket;
    },

    removeSocket(spaceId: string, socketId: string): RoomRemoval {
        owners.get(spaceId)?.delete(socketId);
        const rooms = spaces.get(spaceId);
        const removal: RoomRemoval = { changes: [], effects: noEffects() };
        if (!rooms) return removal;

        for (const [roomKey, room] of rooms) {
            // A request dies with the socket that made it.
            for (const [userId, askedBy] of [...room.pending]) {
                if (askedBy !== socketId) continue;
                removal.effects.cancelled.push(
                    ...cancelPending(roomKey, room, userId)
                );
            }
            if (!room.inside.delete(socketId)) continue;
            endMeetingIfEmpty(room, removal.effects);
            const mustOpen =
                room.state === ROOM_DOOR_STATES.LOCKED && room.inside.size === 0;
            if (!mustOpen) continue;
            room.state = ROOM_DOOR_STATES.OPEN;
            removal.changes.push({ roomKey, state: room.state });
        }
        return removal;
    },

    // Whether two sockets are in the same private rooms, which is also the case
    // when neither is in one. What is said in a room stays in it.
    sameRooms(spaceId: string, socketA: string, socketB: string): boolean {
        const rooms = spaces.get(spaceId);
        if (!rooms) return true;

        return [...rooms.values()].every(
            (room) => room.inside.has(socketA) === room.inside.has(socketB)
        );
    },

    // Marks the socket as the owner of the space, who enters any locked room.
    setOwner(spaceId: string, socketId: string): void {
        const sockets = owners.get(spaceId) ?? new Set<string>();
        sockets.add(socketId);
        owners.set(spaceId, sockets);
    },

    isOwner(spaceId: string, socketId: string): boolean {
        return owners.get(spaceId)?.has(socketId) === true;
    },

    // Someone outside a locked room asks to join. Returns the sockets inside
    // to tell, or null when the request does not apply or is already pending.
    requestJoin(
        spaceId: string,
        roomKey: string,
        socketId: string,
        userId: string
    ): JoinRequested | null {
        const room = getRoom(spaceId, roomKey);
        if (room.state !== ROOM_DOOR_STATES.LOCKED) return null;
        if (room.inside.has(socketId)) return null;
        if (isEntitled(spaceId, room, socketId, userId)) return null;
        if (room.inside.size === 0) return null;
        if (room.pending.has(userId)) return null;

        room.pending.set(userId, socketId);
        return { notify: [...room.inside] };
    },

    // Someone inside answers a pending request. Only the first answer counts.
    answerJoin(
        spaceId: string,
        roomKey: string,
        socketId: string,
        userId: string,
        accept: boolean
    ): JoinAnswered | null {
        const room = getRoom(spaceId, roomKey);
        if (!room.inside.has(socketId)) return null;
        const requesterSocketId = room.pending.get(userId);
        if (!requesterSocketId) return null;

        room.pending.delete(userId);
        if (accept) room.accepted.add(userId);
        return { requesterSocketId, notify: [...room.inside] };
    },

    // The rooms this socket may enter while they are locked.
    entitlements(
        spaceId: string,
        socketId: string,
        userId: string
    ): RoomEntitlements {
        const roomKeys = [...(spaces.get(spaceId) ?? [])]
            .filter(([, room]) => room.accepted.has(userId))
            .map(([roomKey]) => roomKey);
        return { all: RoomStates.isOwner(spaceId, socketId), roomKeys };
    },

    // Every room of the space that is not open.
    listNotOpen(spaceId: string): RoomStateChange[] {
        const rooms = spaces.get(spaceId);
        if (!rooms) return [];

        return [...rooms]
            .filter(([, room]) => room.state !== ROOM_DOOR_STATES.OPEN)
            .map(([roomKey, room]) => ({ roomKey, state: room.state }));
    },

    clear(): void {
        spaces.clear();
        owners.clear();
    },
};
