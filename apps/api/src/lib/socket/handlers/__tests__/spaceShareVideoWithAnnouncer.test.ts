import { beforeEach, describe, expect, it, vi } from "vitest";
import { PresenceStore } from "../../presence/PresenceStore";
import { SpaceInterests } from "../../realtime/SpaceInterests";
import { AnnouncerSync } from "../../realtime/AnnouncerSync";
import { RoomStates } from "../../utils/roomStates";
import { registerSpaceShareVideoWithAnnouncer } from "../spaceShareVideoWithAnnouncer";

type Handler = (payload: unknown, ack: (response: unknown) => void) => void;

const createSocket = (id: string, data: Record<string, unknown>) => {
    const handlers = new Map<string, Handler>();
    return {
        id,
        data,
        on: (event: string, handler: Handler) => handlers.set(event, handler),
        handlers,
    };
};

const presence = (socketId: string) => ({
    socketId,
    userId: `user-${socketId}`,
    name: socketId,
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

const stand = (socketId: string, x: number) => {
    PresenceStore.add("space-1", presence(socketId));
    SpaceInterests.update("space-1", socketId, {
        x,
        y: 0,
        direction: "down",
        isSitting: false,
        isDancing: false,
    });
};

const share = (
    socket: ReturnType<typeof createSocket>,
    payload: unknown
): unknown => {
    const ack = vi.fn();
    socket.handlers.get("space:share-video-with-announcer")?.(payload, ack);
    return ack.mock.calls[0]?.[0];
};

// The speaker announces and the listener is told, as the announcing handler
// does.
const announceNear = () => {
    PresenceStore.setAnnouncing("space-1", "speaker", Date.now());
    AnnouncerSync.refresh("space-1", "listener", vi.fn());
};

const flagOf = (socketId: string) =>
    PresenceStore.get("space-1", socketId)?.sharingVideoWithAnnouncerSince;

describe("registerSpaceShareVideoWithAnnouncer", () => {
    beforeEach(() => {
        PresenceStore.clear();
        SpaceInterests.clear();
        RoomStates.clear();
        AnnouncerSync.clear();
        stand("speaker", 0);
        stand("listener", 100);
    });

    const listenerSocket = () => {
        const socket = createSocket("listener", {
            spaceId: "space-1",
            isGuest: false,
        });
        registerSpaceShareVideoWithAnnouncer(socket as never);
        return socket;
    };

    it("shares the video while someone announces near", () => {
        announceNear();
        const socket = listenerSocket();

        expect(share(socket, { sharing: true })).toEqual({
            ok: true,
            sharingSince: expect.any(Number),
        });
        expect(flagOf("listener")).toEqual(expect.any(Number));
    });

    it("keeps the first start when asked again", () => {
        announceNear();
        const socket = listenerSocket();

        const first = share(socket, { sharing: true }) as {
            sharingSince: number;
        };
        const second = share(socket, { sharing: true }) as {
            sharingSince: number;
        };

        expect(second.sharingSince).toBe(first.sharingSince);
    });

    it("stops sharing when asked", () => {
        announceNear();
        const socket = listenerSocket();
        share(socket, { sharing: true });

        expect(share(socket, { sharing: false })).toEqual({
            ok: true,
            sharingSince: null,
        });
        expect(flagOf("listener")).toBeNull();
    });

    it("refuses to start when nobody announces near", () => {
        const socket = listenerSocket();

        expect(share(socket, { sharing: true })).toEqual({
            ok: false,
            code: "SHARE_VIDEO_NO_ANNOUNCER",
        });
        expect(flagOf("listener")).toBeNull();
    });

    it("clears the choice when the announcement ends", () => {
        announceNear();
        const socket = listenerSocket();
        share(socket, { sharing: true });

        PresenceStore.setAnnouncing("space-1", "speaker", null);
        AnnouncerSync.refresh("space-1", "listener", vi.fn());

        expect(flagOf("listener")).toBeNull();
    });

    it("clears the choice when the announcer walks out of earshot", () => {
        announceNear();
        const socket = listenerSocket();
        share(socket, { sharing: true });

        SpaceInterests.update("space-1", "speaker", {
            x: 5000,
            y: 0,
            direction: "down",
            isSitting: false,
            isDancing: false,
        });
        AnnouncerSync.refresh("space-1", "listener", vi.fn());

        expect(flagOf("listener")).toBeNull();
    });

    it("refuses a guest, a socket outside a space and a bad payload", () => {
        announceNear();
        const guest = createSocket("listener", {
            spaceId: "space-1",
            isGuest: true,
        });
        const outside = createSocket("listener", {
            spaceId: null,
            isGuest: false,
        });
        const member = listenerSocket();
        [guest, outside].forEach((socket) =>
            registerSpaceShareVideoWithAnnouncer(socket as never)
        );

        expect(share(guest, { sharing: true })).toEqual({
            ok: false,
            code: "SHARE_VIDEO_NOT_ALLOWED",
        });
        expect(share(outside, { sharing: true })).toEqual({
            ok: false,
            code: "SHARE_VIDEO_NOT_ALLOWED",
        });
        expect(share(member, { sharing: "yes" })).toEqual({
            ok: false,
            code: "SHARE_VIDEO_INVALID",
        });
    });
});
