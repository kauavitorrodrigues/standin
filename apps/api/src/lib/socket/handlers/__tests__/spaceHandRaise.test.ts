import { beforeEach, describe, expect, it, vi } from "vitest";
import { PresenceStore } from "../../presence/PresenceStore";
import { SpaceInterests } from "../../realtime/SpaceInterests";
import { RaisedHandSync } from "../../realtime/RaisedHandSync";
import { RoomStates } from "../../utils/roomStates";
import { registerSpaceHandRaise } from "../spaceHandRaise";

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
        isDancing: false,
    });
};

const raise = (
    socket: ReturnType<typeof createSocket>,
    payload: unknown
): unknown => {
    const ack = vi.fn();
    socket.handlers.get("space:set-hand-raised")?.(payload, ack);
    return ack.mock.calls[0]?.[0];
};

describe("registerSpaceHandRaise", () => {
    beforeEach(() => {
        PresenceStore.clear();
        SpaceInterests.clear();
        RoomStates.clear();
        RaisedHandSync.clear();
    });

    it("raises a hand, answers with the start and tells who is near", () => {
        stand("speaker", 0);
        stand("near", 100);
        stand("far", 3000);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, to, emit } = createIo();
        registerSpaceHandRaise(io as never, socket as never);

        const answer = raise(socket, { raised: true });

        expect(answer).toEqual({
            ok: true,
            raisedSince: expect.any(Number),
        });
        expect(to).toHaveBeenCalledTimes(1);
        expect(to).toHaveBeenCalledWith("near");
        expect(emit).toHaveBeenCalledWith("space:raised-hands", {
            hands: [expect.objectContaining({ socketId: "speaker" })],
        });
    });

    it("keeps the first start when asked again", () => {
        stand("speaker", 0);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceHandRaise(createIo().io as never, socket as never);

        const first = raise(socket, { raised: true }) as {
            raisedSince: number;
        };
        const second = raise(socket, { raised: true }) as {
            raisedSince: number;
        };

        expect(second.raisedSince).toBe(first.raisedSince);
    });

    it("lowers the hand and tells the ones who saw it", () => {
        stand("speaker", 0);
        stand("near", 100);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, emit } = createIo();
        registerSpaceHandRaise(io as never, socket as never);
        raise(socket, { raised: true });
        emit.mockClear();

        const answer = raise(socket, { raised: false });

        expect(answer).toEqual({ ok: true, raisedSince: null });
        expect(emit).toHaveBeenCalledWith("space:raised-hands", {
            hands: [],
        });
    });

    it("refuses a guest, a socket outside a space and a bad payload", () => {
        stand("speaker", 0);
        const guest = createSocket({ spaceId: "space-1", isGuest: true });
        const outside = createSocket({ spaceId: null, isGuest: false });
        const member = createSocket({ spaceId: "space-1", isGuest: false });
        [guest, outside, member].forEach((socket) =>
            registerSpaceHandRaise(createIo().io as never, socket as never)
        );

        expect(raise(guest, { raised: true })).toEqual({
            ok: false,
            code: "HAND_RAISE_NOT_ALLOWED",
        });
        expect(raise(outside, { raised: true })).toEqual({
            ok: false,
            code: "HAND_RAISE_NOT_ALLOWED",
        });
        expect(raise(member, { raised: "yes" })).toEqual({
            ok: false,
            code: "HAND_RAISE_INVALID",
        });
        expect(PresenceStore.listRaisedHands("space-1")).toEqual([]);
    });
});
