import {
    ChatEvents,
    EditorEvents,
    MediaEvents,
    RoomEvents,
    SpaceEvents,
} from "@standin/contracts";
import type { RateLimit } from "./createRateLimiter";

// What a client waiting for an ack hears when its event was refused. The shape
// fits the acks of the editor lock, which are the ones that use it.
export const RATE_LIMITED_ACK = { ok: false, code: "FORBIDDEN" } as const;

// What every event may do when it has no limit of its own.
export const FALLBACK_RATE_LIMIT: RateLimit = { perSecond: 30, burst: 60 };

// The limit of each event a client sends. Joining and the editor lock are rare
// by nature, and the room events follow a person crossing a door.
export const RATE_LIMITS: Record<string, RateLimit> = {
    [SpaceEvents.SPACE_JOIN]: { perSecond: 1, burst: 5 },
    // The client sends about 12 a second while it walks, so this leaves room
    // for a hiccup that sends a few at once.
    [SpaceEvents.SPACE_POSITION]: { perSecond: 20, burst: 40 },
    [SpaceEvents.SPACE_EMOTE]: { perSecond: 8, burst: 16 },
    [SpaceEvents.SPACE_NEARBY_MESSAGE]: { perSecond: 3, burst: 6 },
    [SpaceEvents.SPACE_NEARBY_TYPING]: { perSecond: 4, burst: 8 },
    [ChatEvents.TYPING]: { perSecond: 4, burst: 8 },
    // Negotiating media is a handful of requests per connection. The room for
    // a reconnect is the burst.
    [MediaEvents.GET_CAPABILITIES]: { perSecond: 2, burst: 6 },
    [MediaEvents.RESTART]: { perSecond: 1, burst: 4 },
    [MediaEvents.RESTART_ICE]: { perSecond: 1, burst: 8 },
    [MediaEvents.CREATE_TRANSPORT]: { perSecond: 2, burst: 6 },
    [MediaEvents.CONNECT_TRANSPORT]: { perSecond: 2, burst: 6 },
    [MediaEvents.PRODUCE]: { perSecond: 4, burst: 12 },
    [MediaEvents.CLOSE_PRODUCER]: { perSecond: 4, burst: 12 },
    [MediaEvents.CONSUMER_READY]: { perSecond: 20, burst: 40 },
    [MediaEvents.SET_FOCUS]: { perSecond: 4, burst: 8 },
    [MediaEvents.SET_PINS]: { perSecond: 4, burst: 8 },
    [MediaEvents.SET_LOW_QUALITY]: { perSecond: 1, burst: 4 },
    [MediaEvents.SET_MUTED]: { perSecond: 4, burst: 8 },
    [MediaEvents.SET_PRIVACY]: { perSecond: 4, burst: 8 },
    [EditorEvents.EDITOR_ACQUIRE]: { perSecond: 1, burst: 5 },
    [EditorEvents.EDITOR_RELEASE]: { perSecond: 1, burst: 5 },
    [EditorEvents.EDITOR_HEARTBEAT]: { perSecond: 2, burst: 5 },
    [RoomEvents.ROOM_CROSSED]: { perSecond: 5, burst: 20 },
    [RoomEvents.ROOM_OPEN]: { perSecond: 2, burst: 10 },
    [RoomEvents.ROOM_PRESENT]: { perSecond: 2, burst: 10 },
    [RoomEvents.ROOM_LOCK]: { perSecond: 2, burst: 10 },
    [RoomEvents.ROOM_UNLOCK]: { perSecond: 2, burst: 10 },
    [RoomEvents.ROOM_JOIN_REQUEST]: { perSecond: 1, burst: 5 },
    [RoomEvents.ROOM_JOIN_ANSWER]: { perSecond: 5, burst: 20 },
};
