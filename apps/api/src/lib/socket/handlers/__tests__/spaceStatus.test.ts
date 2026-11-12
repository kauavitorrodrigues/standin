import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PresenceStore } from "../../presence/PresenceStore";
import { StatusExpiry } from "../../realtime/StatusExpiry";
import { registerSpaceStatus } from "../spaceStatus";

type Handler = (payload: unknown, ack: (response: unknown) => void) => void;

const createSocket = (data: Record<string, unknown>) => {
    const handlers = new Map<string, Handler>();
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    return {
        id: "me",
        data,
        to,
        emit,
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
    availability: "active" as const,
    customStatus: null,
    announcingSince: null,
    sharingVideoWithAnnouncerSince: null,
    handRaisedSince: null,
    activeInteractionObjectId: null,
});

const send = (
    socket: ReturnType<typeof createSocket>,
    payload: unknown
): unknown => {
    const ack = vi.fn();
    socket.handlers.get("space:set-status")?.(payload, ack);
    return ack.mock.calls[0]?.[0];
};

const NOW = 2_000_000;
const lunch = (expiresAt: number | null) => ({
    text: "Lunch",
    emoji: "🍕",
    expiresAt,
});

describe("registerSpaceStatus", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
        PresenceStore.clear();
        StatusExpiry.clear();
        PresenceStore.add("space-1", presence("me"));
    });

    afterEach(() => {
        StatusExpiry.clear();
        vi.useRealTimers();
    });

    it("keeps the status in the presence, answers and tells the space", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceStatus(createIo().io as never, socket as never);
        const status = {
            availability: "away",
            customStatus: lunch(NOW + 60_000),
        };

        const answer = send(socket, status);

        expect(answer).toEqual({ ok: true, status });
        expect(PresenceStore.get("space-1", "me")).toMatchObject(status);
        expect(socket.to).toHaveBeenCalledWith("space:space-1");
        expect(socket.emit).toHaveBeenCalledWith("space:status", {
            socketId: "me",
            userId: "user-me",
            ...status,
        });
    });

    it("tells nobody when the status did not change", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        registerSpaceStatus(createIo().io as never, socket as never);
        const status = { availability: "away", customStatus: null };
        send(socket, status);
        socket.emit.mockClear();

        expect(send(socket, status)).toEqual({ ok: true, status });
        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("clears the custom status by itself when the time is up", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, to, emit } = createIo();
        registerSpaceStatus(io as never, socket as never);
        send(socket, {
            availability: "away",
            customStatus: lunch(NOW + 60_000),
        });

        vi.advanceTimersByTime(59_999);
        expect(to).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(PresenceStore.get("space-1", "me")).toMatchObject({
            availability: "away",
            customStatus: null,
        });
        expect(to).toHaveBeenCalledWith("space:space-1");
        expect(emit).toHaveBeenCalledWith("space:status", {
            socketId: "me",
            userId: "user-me",
            availability: "away",
            customStatus: null,
        });
    });

    it("does not clear a status the person replaced before the time", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, emit } = createIo();
        registerSpaceStatus(io as never, socket as never);
        send(socket, {
            availability: "active",
            customStatus: lunch(NOW + 60_000),
        });
        send(socket, {
            availability: "active",
            customStatus: lunch(NOW + 3_600_000),
        });

        vi.advanceTimersByTime(120_000);

        expect(emit).not.toHaveBeenCalled();
        expect(PresenceStore.get("space-1", "me")?.customStatus).not.toBeNull();
    });

    it("stops the timer when the person clears the status", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: false });
        const { io, emit } = createIo();
        registerSpaceStatus(io as never, socket as never);
        send(socket, {
            availability: "active",
            customStatus: lunch(NOW + 60_000),
        });
        send(socket, { availability: "active", customStatus: null });

        vi.advanceTimersByTime(120_000);

        expect(emit).not.toHaveBeenCalled();
        expect(StatusExpiry.size()).toBe(0);
    });

    it("lets a guest have a status", () => {
        const socket = createSocket({ spaceId: "space-1", isGuest: true });
        registerSpaceStatus(createIo().io as never, socket as never);

        expect(
            send(socket, { availability: "away", customStatus: null })
        ).toMatchObject({ ok: true });
    });

    it("refuses a socket outside a space, one not in the presence and a bad payload", () => {
        const outside = createSocket({ spaceId: null, isGuest: false });
        const absent = createSocket({ spaceId: "space-2", isGuest: false });
        const member = createSocket({ spaceId: "space-1", isGuest: false });
        [outside, absent, member].forEach((socket) =>
            registerSpaceStatus(createIo().io as never, socket as never)
        );
        const valid = { availability: "away", customStatus: null };

        expect(send(outside, valid)).toEqual({
            ok: false,
            code: "STATUS_NOT_ALLOWED",
        });
        expect(send(absent, valid)).toEqual({
            ok: false,
            code: "STATUS_NOT_ALLOWED",
        });
        expect(
            send(member, { availability: "busy", customStatus: null })
        ).toEqual({
            ok: false,
            code: "STATUS_INVALID",
        });
        expect(
            send(member, {
                availability: "away",
                customStatus: lunch(NOW - 10_000),
            })
        ).toEqual({ ok: false, code: "STATUS_INVALID" });
        expect(PresenceStore.get("space-1", "me")?.availability).toBe("active");
    });
});
