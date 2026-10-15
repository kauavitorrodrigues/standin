import {
    ROOM_DOOR_STATES,
    RoomEvents,
    type RoomCrossDirection,
    type RoomDoorState,
    type RoomEntitlementsPayload,
    type RoomJoinCancelledPayload,
    type RoomJoinDecisionPayload,
    type RoomJoinRequestedPayload,
    type RoomStatePayload,
    type RoomStatesPayload,
} from "@standin/contracts";
import type { RoomDoorStates } from "@/features/game/types/room";

// The only part of the socket the sync needs, so a fake can stand in.
export type RoomDoorPort = {
    emit: (event: string, payload: unknown) => void;
};

type Listener = (states: RoomDoorStates) => void;

export type RoomJoinRequest = { roomKey: string; userId: string };

// The locked rooms the local user may enter without asking.
export type RoomEntitlements = {
    all: boolean;
    roomKeys: ReadonlySet<string>;
};

const NO_ENTITLEMENTS: RoomEntitlements = {
    all: false,
    roomKeys: new Set(),
};

// Mirror of the room doors the server owns. It never decides a state, it only
// replays what the server sent and asks the server for changes.
export class RoomDoorSync {
    private states = new Map<string, RoomDoorState>();
    private snapshot: RoomDoorStates = new Map();
    private readonly listeners = new Set<Listener>();

    private readonly snapshotListeners = new Set<() => void>();

    private joinRequests: readonly RoomJoinRequest[] = [];
    private entitlements: RoomEntitlements = NO_ENTITLEMENTS;
    private readonly requestListeners = new Set<() => void>();
    private readonly entitlementListeners = new Set<() => void>();
    private readonly decisionListeners = new Set<
        (decision: RoomJoinDecisionPayload) => void
    >();

    private readonly port: RoomDoorPort;

    constructor(port: RoomDoorPort) {
        this.port = port;
    }

    // Fires on every snapshot the server sends, which follows each join and so
    // each reconnect.
    subscribeSnapshot(listener: () => void): () => void {
        this.snapshotListeners.add(listener);
        return () => {
            this.snapshotListeners.delete(listener);
        };
    }

    getStates(): RoomDoorStates {
        return this.snapshot;
    }

    getState(roomKey: string): RoomDoorState {
        return this.states.get(roomKey) ?? ROOM_DOOR_STATES.OPEN;
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    applyStates(payload: RoomStatesPayload): void {
        this.states = new Map();
        for (const room of payload.rooms) {
            this.set(room);
        }
        this.publish();
        for (const listener of this.snapshotListeners) listener();
    }

    applyState(payload: RoomStatePayload): void {
        this.set(payload);
        this.publish();
    }

    crossed(roomKey: string, direction: RoomCrossDirection): void {
        this.port.emit(RoomEvents.ROOM_CROSSED, { roomKey, direction });
    }

    present(roomKey: string): void {
        this.port.emit(RoomEvents.ROOM_PRESENT, { roomKey });
    }

    open(roomKey: string): void {
        this.port.emit(RoomEvents.ROOM_OPEN, { roomKey });
    }

    lock(roomKey: string): void {
        this.port.emit(RoomEvents.ROOM_LOCK, { roomKey });
    }

    unlock(roomKey: string): void {
        this.port.emit(RoomEvents.ROOM_UNLOCK, { roomKey });
    }

    requestJoin(roomKey: string): void {
        this.port.emit(RoomEvents.ROOM_JOIN_REQUEST, { roomKey });
    }

    answerJoin(roomKey: string, userId: string, accept: boolean): void {
        this.port.emit(RoomEvents.ROOM_JOIN_ANSWER, {
            roomKey,
            userId,
            accept,
        });
    }

    getJoinRequests(): readonly RoomJoinRequest[] {
        return this.joinRequests;
    }

    subscribeJoinRequests(listener: () => void): () => void {
        this.requestListeners.add(listener);
        return () => {
            this.requestListeners.delete(listener);
        };
    }

    applyJoinRequested({ roomKey, userId }: RoomJoinRequestedPayload): void {
        const known = this.joinRequests.some(
            (request) =>
                request.roomKey === roomKey && request.userId === userId
        );
        if (known) return;
        this.joinRequests = [...this.joinRequests, { roomKey, userId }];
        for (const listener of this.requestListeners) listener();
    }

    applyJoinCancelled({ roomKey, userId }: RoomJoinCancelledPayload): void {
        const remaining = this.joinRequests.filter(
            (request) =>
                request.roomKey !== roomKey || request.userId !== userId
        );
        if (remaining.length === this.joinRequests.length) return;
        this.joinRequests = remaining;
        for (const listener of this.requestListeners) listener();
    }

    getEntitlements(): RoomEntitlements {
        return this.entitlements;
    }

    subscribeEntitlements(listener: () => void): () => void {
        this.entitlementListeners.add(listener);
        return () => {
            this.entitlementListeners.delete(listener);
        };
    }

    applyEntitlements({ all, roomKeys }: RoomEntitlementsPayload): void {
        this.entitlements = { all, roomKeys: new Set(roomKeys) };
        for (const listener of this.entitlementListeners) listener();
    }

    subscribeDecision(
        listener: (decision: RoomJoinDecisionPayload) => void
    ): () => void {
        this.decisionListeners.add(listener);
        return () => {
            this.decisionListeners.delete(listener);
        };
    }

    applyDecision(decision: RoomJoinDecisionPayload): void {
        for (const listener of this.decisionListeners) listener(decision);
    }

    private set({ roomKey, state }: RoomStatePayload): void {
        switch (state) {
            case ROOM_DOOR_STATES.OPEN:
                this.states.delete(roomKey);
                return;
            default:
                this.states.set(roomKey, state);
        }
    }

    private publish(): void {
        this.snapshot = new Map(this.states);
        for (const listener of this.listeners) {
            listener(this.snapshot);
        }
    }
}
