import { beforeEach, describe, expect, it, vi } from "vitest";

const { isWebsiteMock } = vi.hoisted(() => ({ isWebsiteMock: vi.fn() }));

vi.mock("../../services/isWebsiteObjectOfSpace", () => ({
    isWebsiteObjectOfSpace: isWebsiteMock,
}));

import { PresenceStore } from "../../presence/PresenceStore";
import { registerSpaceActiveObject } from "../spaceActiveObject";

type Handler = (
    payload: unknown,
    ack: (response: unknown) => void
) => Promise<void>;

const createSocket = (data: Record<string, unknown>) => {
    const handlers = new Map<string, Handler>();
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    return {
        id: "viewer",
        data,
        to,
        emit,
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
    announcingSince: null,
    sharingVideoWithAnnouncerSince: null,
    handRaisedSince: null,
    activeInteractionObjectId: null,
});

const open = async (
    socket: ReturnType<typeof createSocket>,
    payload: unknown
): Promise<unknown> => {
    const ack = vi.fn();
    await socket.handlers.get("space:set-active-object")?.(payload, ack);
    return ack.mock.calls[0]?.[0];
};

describe("registerSpaceActiveObject", () => {
    beforeEach(() => {
        PresenceStore.clear();
        isWebsiteMock.mockReset();
        isWebsiteMock.mockResolvedValue(true);
        PresenceStore.add("space-1", presence("viewer"));
    });

    it("opens an object, keeps it in the presence and tells the space", async () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);

        const answer = await open(socket, { objectId: "object-1" });

        expect(answer).toEqual({ ok: true, objectId: "object-1" });
        expect(isWebsiteMock).toHaveBeenCalledWith("space-1", "object-1");
        expect(
            PresenceStore.get("space-1", "viewer")?.activeInteractionObjectId
        ).toBe("object-1");
        expect(socket.to).toHaveBeenCalledWith("space:space-1");
        expect(socket.emit).toHaveBeenCalledWith("space:active-object", {
            socketId: "viewer",
            userId: "user-viewer",
            objectId: "object-1",
        });
    });

    it("lets a guest look at an object", async () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: true });
        registerSpaceActiveObject(socket as never);

        expect(await open(socket, { objectId: "object-1" })).toEqual({
            ok: true,
            objectId: "object-1",
        });
    });

    it("closes the object without asking the database", async () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);
        await open(socket, { objectId: "object-1" });
        isWebsiteMock.mockClear();

        const answer = await open(socket, { objectId: null });

        expect(answer).toEqual({ ok: true, objectId: null });
        expect(isWebsiteMock).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenLastCalledWith("space:active-object", {
            socketId: "viewer",
            userId: "user-viewer",
            objectId: null,
        });
    });

    it("does not tell the space again when nothing changed", async () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);
        await open(socket, { objectId: "object-1" });
        socket.emit.mockClear();

        await open(socket, { objectId: "object-1" });

        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("refuses an object that is not a website of the space", async () => {
        isWebsiteMock.mockResolvedValue(false);
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);

        expect(await open(socket, { objectId: "other" })).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_INVALID",
        });
        expect(socket.emit).not.toHaveBeenCalled();
        expect(
            PresenceStore.get("space-1", "viewer")?.activeInteractionObjectId
        ).toBeNull();
    });

    it("refuses a payload that is not an object id", async () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);

        expect(await open(socket, { objectId: 7 })).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_INVALID",
        });
        expect(isWebsiteMock).not.toHaveBeenCalled();
    });

    it("refuses a socket that has not joined a space", async () => {
        const socket = createSocket({ spaceId: null });
        registerSpaceActiveObject(socket as never);

        expect(await open(socket, { objectId: "object-1" })).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_NOT_ALLOWED",
        });
    });

    it("refuses when the socket left while the object was checked", async () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);
        isWebsiteMock.mockImplementation(async () => {
            socket.data.spaceId = null;
            return true;
        });

        expect(await open(socket, { objectId: "object-1" })).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_NOT_ALLOWED",
        });
    });

    it("answers a failure of the lookup without throwing", async () => {
        const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
        isWebsiteMock.mockRejectedValue(new TypeError("database down"));
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceActiveObject(socket as never);

        expect(await open(socket, { objectId: "object-1" })).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_INVALID",
        });
        quiet.mockRestore();
    });
});
