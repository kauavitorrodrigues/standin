import { beforeEach, describe, expect, it, vi } from "vitest";

const { neighborsMock, settingsMock } = vi.hoisted(() => ({
    neighborsMock: vi.fn(),
    settingsMock: vi.fn(),
}));

vi.mock("../../realtime/SpaceInterests", () => ({
    SpaceInterests: { neighbors: neighborsMock },
}));

vi.mock("../../services/resolveSpaceSettings", () => ({
    resolveSpaceSettings: settingsMock,
}));

import { registerSpaceEvents } from "../spaceEvents";
import { RoomStates } from "../../utils/roomStates";

const createSocket = () => {
    const handlers = new Map<string, (payload: unknown) => unknown>();
    return {
        id: "sender",
        data: { spaceId: "space-1" },
        on: (event: string, handler: (payload: unknown) => unknown) => {
            handlers.set(event, handler);
        },
        handlers,
    };
};

const createIo = () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    return { io: { to }, to, emit };
};

const EMOTE = { emoji: "👍", count: 1 };
const MESSAGE = { text: "oi" };

describe("registerSpaceEvents", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        RoomStates.clear();
        neighborsMock.mockReturnValue(["near-1", "near-2"]);
        settingsMock.mockResolvedValue({ enableSendNearbyInMapView: true });
    });

    it("sends an emote once, to the neighbors, stamped with the sender", () => {
        const socket = createSocket();
        const { io, to, emit } = createIo();
        registerSpaceEvents(io as never, socket as never);

        socket.handlers.get("space:emote")?.(EMOTE);

        expect(to).toHaveBeenCalledTimes(1);
        expect(to).toHaveBeenCalledWith(["near-1", "near-2"]);
        expect(emit).toHaveBeenCalledWith(
            "space:emote",
            expect.objectContaining({ socketId: "sender" })
        );
    });

    it("keeps what is said inside a private room away from who is outside", () => {
        RoomStates.cross("space-1", "room-a", "sender", "u1", "in");
        RoomStates.cross("space-1", "room-a", "near-1", "u2", "in");
        const socket = createSocket();
        const { io, to } = createIo();
        registerSpaceEvents(io as never, socket as never);

        socket.handlers.get("space:emote")?.(EMOTE);

        expect(to).toHaveBeenCalledWith(["near-1"]);
    });

    it("sends nothing when nobody is near", () => {
        neighborsMock.mockReturnValue([]);
        const socket = createSocket();
        const { io, to } = createIo();
        registerSpaceEvents(io as never, socket as never);

        socket.handlers.get("space:emote")?.(EMOTE);

        expect(to).not.toHaveBeenCalled();
    });

    it("drops a nearby message when the space turned it off", async () => {
        settingsMock.mockResolvedValue({ enableSendNearbyInMapView: false });
        const socket = createSocket();
        const { io, to } = createIo();
        registerSpaceEvents(io as never, socket as never);

        socket.handlers.get("space:nearby-message")?.(MESSAGE);
        await vi.waitFor(() => expect(settingsMock).toHaveBeenCalled());
        await Promise.resolve();

        expect(to).not.toHaveBeenCalled();
    });

    it("relays a nearby message when the space allows it", async () => {
        const socket = createSocket();
        const { io, to } = createIo();
        registerSpaceEvents(io as never, socket as never);

        socket.handlers.get("space:nearby-message")?.(MESSAGE);

        await vi.waitFor(() => expect(to).toHaveBeenCalledTimes(1));
    });
});
