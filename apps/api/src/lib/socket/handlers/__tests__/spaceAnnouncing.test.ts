import { beforeEach, describe, expect, it, vi } from "vitest";
import { PresenceStore } from "../../presence/PresenceStore";
import { SpaceInterests } from "../../realtime/SpaceInterests";
import { AnnouncerSync } from "../../realtime/AnnouncerSync";
import { RoomStates } from "../../utils/roomStates";
import { registerSpaceAnnouncing } from "../spaceAnnouncing";

type Handler = (payload: unknown, ack: (response: unknown) => void) => void;

const createSocket = (data: Record<string, unknown>) => {
    const handlers = new Map<string, Handler>();
    return {
        id: "speaker",
        data,
        on: (event: string, handler: Handler) => handlers.set(event, handler),
        handlers,
    };
};

const createIo = () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    return { io: { to }, to, emit };
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
    announcingSince: null,
    sharingVideoWithAnnouncerSince: null,
    handRaisedSince: null,
});

const stand = (socketId: string, x: number) => {
    PresenceStore.add("space-1", presence(socketId));
    SpaceInterests.update("space-1", socketId, {
        x,
        y: 0,
        direction: "down",
        isSitting: false,
    });
};

const announce = (
    socket: ReturnType<typeof createSocket>,
    payload: unknown
): unknown => {
    const ack = vi.fn();
    socket.handlers.get("space:set-announcing")?.(payload, ack);
    return ack.mock.calls[0]?.[0];
};

describe("registerSpaceAnnouncing", () => {
    beforeEach(() => {
        PresenceStore.clear();
        SpaceInterests.clear();
        RoomStates.clear();
        AnnouncerSync.clear();
    });

    it("starts announcing, answers with the start and tells who is near", () => {
        stand("speaker", 0);
        stand("near", 100);
        stand("far", 3000);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, to, emit } = createIo();
        registerSpaceAnnouncing(io as never, socket as never);

        const answer = announce(socket, { announcing: true });

        expect(answer).toEqual({
            ok: true,
            announcingSince: expect.any(Number),
        });
        expect(to).toHaveBeenCalledTimes(1);
        expect(to).toHaveBeenCalledWith("near");
        expect(emit).toHaveBeenCalledWith("space:announcers", {
            announcers: [expect.objectContaining({ socketId: "speaker" })],
        });
    });

    it("keeps the first start when asked again", () => {
        stand("speaker", 0);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceAnnouncing(createIo().io as never, socket as never);

        const first = announce(socket, { announcing: true }) as {
            announcingSince: number;
        };
        const second = announce(socket, { announcing: true }) as {
            announcingSince: number;
        };

        expect(second.announcingSince).toBe(first.announcingSince);
    });

    it("stops announcing and tells the ones who heard", () => {
        stand("speaker", 0);
        stand("near", 100);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, emit } = createIo();
        registerSpaceAnnouncing(io as never, socket as never);
        announce(socket, { announcing: true });
        emit.mockClear();

        const answer = announce(socket, { announcing: false });

        expect(answer).toEqual({ ok: true, announcingSince: null });
        expect(emit).toHaveBeenCalledWith("space:announcers", {
            announcers: [],
        });
    });

    it("refuses a guest, a socket outside a space and a bad payload", () => {
        stand("speaker", 0);
        const guest = createSocket({ spaceId: "space-1", isGuest: true });
        const outside = createSocket({ spaceId: null, isGuest: false });
        const member = createSocket({ spaceId: "space-1", isGuest: false });
        [guest, outside, member].forEach((socket) =>
            registerSpaceAnnouncing(createIo().io as never, socket as never)
        );

        expect(announce(guest, { announcing: true })).toEqual({
            ok: false,
            code: "ANNOUNCING_NOT_ALLOWED",
        });
        expect(announce(outside, { announcing: true })).toEqual({
            ok: false,
            code: "ANNOUNCING_NOT_ALLOWED",
        });
        expect(announce(member, { announcing: "yes" })).toEqual({
            ok: false,
            code: "ANNOUNCING_INVALID",
        });
        expect(PresenceStore.listAnnouncers("space-1")).toEqual([]);
    });
});
