import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { room, getRoom, markMoved } = vi.hoisted(() => {
    const room = { hasPeer: vi.fn(), setAway: vi.fn() };
    return { room, getRoom: vi.fn(), markMoved: vi.fn() };
});

vi.mock("@/lib/media/MediaRuntime", () => ({
    MediaRuntime: { getRoom },
    mediaDirty: { markMoved },
}));

import { PresenceStore } from "../../presence/PresenceStore";
import { StatusExpiry } from "../../realtime/StatusExpiry";
import { registerSpaceStatus } from "../spaceStatus";

type Handler = (payload: unknown, ack: (response: unknown) => void) => void;

const createSocket = () => {
    const handlers = new Map<string, Handler>();
    const emit = vi.fn();
    return {
        id: "me",
        data: { spaceId: "space-1", isGuest: false },
        to: vi.fn().mockReturnValue({ emit }),
        emit,
        on: (event: string, handler: Handler) => handlers.set(event, handler),
        handlers,
    };
};

const presence = () => ({
    socketId: "me",
    userId: "user-me",
    name: "me",
    profilePictureUrl: null,
    avatarSheetFileId: null,
    muted: false,
    headphones: false,
    focus: false,
    availability: "active" as const,
    customStatus: null,
    announcingSince: null,
    sharingVideoWithAnnouncerSince: null,
    handRaisedSince: null,
    activeInteractionObjectId: null,
});

const send = (socket: ReturnType<typeof createSocket>, payload: unknown) =>
    socket.handlers.get("space:set-status")?.(payload, vi.fn());

const away = { availability: "away", customStatus: null };
const active = { availability: "active", customStatus: null };

let socket: ReturnType<typeof createSocket>;

beforeEach(() => {
    PresenceStore.clear();
    StatusExpiry.clear();
    PresenceStore.add("space-1", presence());
    room.hasPeer.mockReset().mockReturnValue(true);
    room.setAway.mockReset();
    getRoom.mockReset().mockReturnValue(room);
    markMoved.mockReset();
    socket = createSocket();
    registerSpaceStatus({ to: vi.fn() } as never, socket as never);
});

afterEach(() => StatusExpiry.clear());

describe("away in the media of the space", () => {
    it("cuts the person from the media and marks their neighbours", () => {
        send(socket, away);

        expect(room.setAway).toHaveBeenCalledWith("me", true);
        expect(markMoved).toHaveBeenCalledWith("space-1", "me");
    });

    it("restores the person on return", () => {
        send(socket, away);
        room.setAway.mockClear();
        markMoved.mockClear();

        send(socket, active);

        expect(room.setAway).toHaveBeenCalledWith("me", false);
        expect(markMoved).toHaveBeenCalledWith("space-1", "me");
    });

    it("does not touch the media when only the custom status changes", () => {
        send(socket, away);
        room.setAway.mockClear();
        markMoved.mockClear();

        send(socket, {
            availability: "away",
            customStatus: { text: "Lunch", emoji: "", expiresAt: null },
        });

        expect(room.setAway).not.toHaveBeenCalled();
        expect(markMoved).not.toHaveBeenCalled();
    });

    it("does not touch the media for a repeated status", () => {
        send(socket, away);
        room.setAway.mockClear();
        markMoved.mockClear();

        send(socket, away);

        expect(room.setAway).not.toHaveBeenCalled();
        expect(markMoved).not.toHaveBeenCalled();
    });

    it("leaves the media alone when the person has no media session yet", () => {
        room.hasPeer.mockReturnValue(false);

        send(socket, away);

        expect(room.setAway).not.toHaveBeenCalled();
        expect(PresenceStore.get("space-1", "me")?.availability).toBe("away");
    });

    it("works when the space has no media room at all", () => {
        getRoom.mockReturnValue(undefined);

        expect(() => send(socket, away)).not.toThrow();
        expect(PresenceStore.get("space-1", "me")?.availability).toBe("away");
    });

    it("keeps the avatar in the presence for the others, with its status", () => {
        send(socket, {
            availability: "away",
            customStatus: { text: "Lunch", emoji: "🍕", expiresAt: null },
        });

        expect(socket.emit).toHaveBeenCalledWith(
            "space:status",
            expect.objectContaining({ socketId: "me", availability: "away" })
        );
        expect(PresenceStore.list("space-1")).toHaveLength(1);
    });
});
