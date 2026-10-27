import { beforeEach, describe, expect, it, vi } from "vitest";
const { resolveSpaceSettingsMock } = vi.hoisted(() => ({
    resolveSpaceSettingsMock: vi.fn(),
}));

vi.mock("../../services/resolveSpaceSettings", () => ({
    resolveSpaceSettings: resolveSpaceSettingsMock,
}));

import { registerSpacePosition } from "../spacePosition";
import { registerSpaceEvents } from "../spaceEvents";
import { SpaceInterests } from "../../realtime/SpaceInterests";
import { mediaDirty } from "@/lib/media/MediaRuntime";

const createSocket = (id: string, spaceId: string | null) => {
    const handlers = new Map<string, (payload: unknown) => void>();
    return {
        id,
        data: { spaceId, userId: `user-${id}` },
        on: vi.fn((event: string, handler: (payload: unknown) => void) => {
            handlers.set(event, handler);
        }),
        fire: (event: string, payload: unknown) => handlers.get(event)?.(payload),
    };
};

const position = { x: 10.4, y: 20.6, direction: "up", isSitting: false };

describe("registerSpacePosition", () => {
    beforeEach(() => SpaceInterests.clear());

    it("stores the position rounded, for the socket and space it came from", () => {
        const socket = createSocket("s1", "space-1");
        registerSpacePosition(socket as any);

        socket.fire("space:position", position);

        expect(SpaceInterests.get("space-1", "s1")).toEqual({
            x: 10,
            y: 21,
            direction: "up",
            isSitting: false,
        });
    });

    it("marks a person who moved for the media planner, and not one who stood still", () => {
        const socket = createSocket("s1", "space-mark");
        registerSpacePosition(socket as any);
        const take = () =>
            mediaDirty.take(
                "space-mark",
                { get: () => undefined, query: () => [] },
                new Map(),
                100
            );

        socket.fire("space:position", position);
        expect([...take()]).toEqual(["s1"]);

        socket.fire("space:position", position);
        expect([...take()]).toEqual([]);

        socket.fire("space:position", { ...position, x: 200 });
        expect([...take()]).toEqual(["s1"]);
    });

    it("ignores a socket that is in no space and an invalid payload", () => {
        const outside = createSocket("s1", null);
        registerSpacePosition(outside as any);
        outside.fire("space:position", position);

        const inside = createSocket("s2", "space-1");
        registerSpacePosition(inside as any);
        inside.fire("space:position", { ...position, x: Number.NaN });

        expect(SpaceInterests.get("space-1", "s1")).toBeUndefined();
        expect(SpaceInterests.get("space-1", "s2")).toBeUndefined();
    });
});

describe("registerSpaceEvents", () => {
    beforeEach(() => {
        SpaceInterests.clear();
        resolveSpaceSettingsMock.mockResolvedValue({
            enableSendNearbyInMapView: true,
        });
    });

    const build = () => {
        const emitted: { to: string[]; event: string; payload: unknown }[] = [];
        const io = {
            to: (to: string[]) => ({
                emit: (event: string, payload: unknown) =>
                    emitted.push({ to, event, payload }),
            }),
        };
        return { io, emitted };
    };

    it("relays an emote only to the people near the sender, stamped with the socket", () => {
        const { io, emitted } = build();
        const sender = createSocket("a", "space-1");
        registerSpaceEvents(io as any, sender as any);
        SpaceInterests.update("space-1", "a", { ...position, x: 0, y: 0 } as any);
        SpaceInterests.update("space-1", "b", { ...position, x: 100, y: 0 } as any);
        SpaceInterests.update("space-1", "c", { ...position, x: 5000, y: 0 } as any);

        sender.fire("space:emote", { emoji: "👍", count: 2 });

        expect(emitted).toEqual([
            {
                to: ["b"],
                event: "space:emote",
                payload: { socketId: "a", emoji: "👍", count: 2 },
            },
        ]);
    });

    it("drops an invalid emote", () => {
        const { io, emitted } = build();
        const sender = createSocket("a", "space-1");
        registerSpaceEvents(io as any, sender as any);
        SpaceInterests.update("space-1", "a", position as any);
        SpaceInterests.update("space-1", "b", position as any);

        sender.fire("space:emote", { emoji: "👍", count: 99 });

        expect(emitted).toEqual([]);
    });

    it.each([
        ["space:nearby-message", { text: "oi" }],
        ["space:nearby-typing", { isTyping: true }],
    ])("relays %s when the space allows send nearby", async (event, body) => {
        const { io, emitted } = build();
        const sender = createSocket("a", "space-1");
        registerSpaceEvents(io as any, sender as any);
        SpaceInterests.update("space-1", "a", position as any);
        SpaceInterests.update("space-1", "b", position as any);

        sender.fire(event, body);
        await vi.waitFor(() => expect(emitted).toHaveLength(1));

        expect(emitted[0]).toEqual({
            to: ["b"],
            event,
            payload: { socketId: "a", ...body },
        });
    });

    it.each([
        ["space:nearby-message", { text: "oi" }],
        ["space:nearby-typing", { isTyping: true }],
    ])("rejects %s when the space turned send nearby off", async (event, body) => {
        resolveSpaceSettingsMock.mockResolvedValue({
            enableSendNearbyInMapView: false,
        });
        const { io, emitted } = build();
        const sender = createSocket("a", "space-1");
        registerSpaceEvents(io as any, sender as any);
        SpaceInterests.update("space-1", "a", position as any);
        SpaceInterests.update("space-1", "b", position as any);

        sender.fire(event, body);
        await vi.waitFor(() =>
            expect(resolveSpaceSettingsMock).toHaveBeenCalledWith("space-1")
        );
        await Promise.resolve();

        expect(emitted).toEqual([]);
    });
});
