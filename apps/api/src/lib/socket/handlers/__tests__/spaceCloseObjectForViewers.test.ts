import { beforeEach, describe, expect, it, vi } from "vitest";
import { PresenceStore } from "../../presence/PresenceStore";
import { registerSpaceCloseObjectForViewers } from "../spaceCloseObjectForViewers";

type Handler = (payload: unknown, ack: (response: unknown) => void) => void;

const createSocket = (data: Record<string, unknown>) => {
    const handlers = new Map<string, Handler>();
    return {
        id: "closer",
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

const presence = (socketId: string, activeObject: string | null) => ({
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
    activeInteractionObjectId: activeObject,
});

const close = (
    socket: ReturnType<typeof createSocket>,
    payload: unknown
): unknown => {
    const ack = vi.fn();
    socket.handlers.get("space:close-object-for-viewers")?.(payload, ack);
    return ack.mock.calls[0]?.[0];
};

describe("registerSpaceCloseObjectForViewers", () => {
    beforeEach(() => {
        PresenceStore.clear();
        PresenceStore.add("space-1", presence("closer", "object-1"));
        PresenceStore.add("space-1", presence("other", "object-1"));
        PresenceStore.add("space-1", presence("elsewhere", "object-2"));
    });

    it("closes the object for everyone looking at it and tells the space", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, to, emit } = createIo();
        registerSpaceCloseObjectForViewers(io as never, socket as never);

        expect(close(socket, { objectId: "object-1" })).toEqual({ ok: true });

        expect(to).toHaveBeenCalledWith("space:space-1");
        expect(emit).toHaveBeenCalledWith("space:object-closed", {
            objectId: "object-1",
            closedByUserId: "user-closer",
        });
        expect(
            PresenceStore.listActiveObjects("space-1").map((e) => e.socketId)
        ).toEqual(["elsewhere"]);
    });

    it("does not let a guest close it for the others", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: true });
        const { io, emit } = createIo();
        registerSpaceCloseObjectForViewers(io as never, socket as never);

        expect(close(socket, { objectId: "object-1" })).toEqual({
            ok: false,
            code: "CLOSE_OBJECT_FOR_VIEWERS_NOT_ALLOWED",
        });
        expect(emit).not.toHaveBeenCalled();
        expect(PresenceStore.listActiveObjects("space-1")).toHaveLength(3);
    });

    it("does not let someone who is not looking at the object close it", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, emit } = createIo();
        registerSpaceCloseObjectForViewers(io as never, socket as never);

        expect(close(socket, { objectId: "object-2" })).toEqual({
            ok: false,
            code: "CLOSE_OBJECT_FOR_VIEWERS_NOT_ALLOWED",
        });
        expect(emit).not.toHaveBeenCalled();
    });

    it("refuses a payload without an object id", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io } = createIo();
        registerSpaceCloseObjectForViewers(io as never, socket as never);

        expect(close(socket, {})).toEqual({
            ok: false,
            code: "CLOSE_OBJECT_FOR_VIEWERS_INVALID",
        });
    });

    it("refuses a socket that has not joined a space", () => {
        const socket = createSocket({ spaceId: null });
        const { io } = createIo();
        registerSpaceCloseObjectForViewers(io as never, socket as never);

        expect(close(socket, { objectId: "object-1" })).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_NOT_ALLOWED",
        });
    });
});
