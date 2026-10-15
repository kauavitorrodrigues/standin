import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByIdMock, getAccessMock, emitToSocketMock, emitToRoomMock } =
    vi.hoisted(() => ({
        findByIdMock: vi.fn(),
        getAccessMock: vi.fn(),
        emitToSocketMock: vi.fn(),
        emitToRoomMock: vi.fn(),
    }));

vi.mock("@standin/core", async () => {
    const actual = await vi.importActual<typeof import("@standin/core")>(
        "@standin/core"
    );
    return {
        ...actual,
        UserService: { findById: findByIdMock },
        MapService: { getAccess: getAccessMock },
    };
});

vi.mock("../../socketManager", () => ({
    SocketManager: {
        emitToSocket: emitToSocketMock,
        emitToRoom: emitToRoomMock,
    },
}));

vi.mock("@/lib/socket/socketManager", () => ({
    SocketManager: {
        emitToSocket: emitToSocketMock,
        emitToRoom: emitToRoomMock,
    },
}));

import { MapLockService } from "@standin/core";
import { registerEditorAcquire } from "../editorAcquire";
import { registerEditorHeartbeat } from "../editorHeartbeat";
import { registerEditorRelease } from "../editorRelease";
import { registerDisconnect } from "../disconnect";
import { EditorSessions } from "../../utils/editorSessions";

function createFakeSocket(id: string, userId: string) {
    return {
        id,
        data: { userId, spaceId: null as string | null },
        on: vi.fn(),
        to: vi.fn().mockReturnValue({ emit: vi.fn() }),
    };
}

type FakeSocket = ReturnType<typeof createFakeSocket>;

function handler(socket: FakeSocket, event: string) {
    return socket.on.mock.calls.find(([name]) => name === event)?.[1];
}

const spaceAccess = {
    mapId: "map-1",
    owner: { kind: "space", spaceId: "space-1", organizationId: "org-1" },
    canRead: true,
    canEdit: true,
    canDecorate: true,
};

const templateAccess = {
    ...spaceAccess,
    owner: { kind: "template" },
};

describe("editor lock handlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        EditorSessions.clear();
        MapLockService.release("map-1", "s1");
        MapLockService.release("map-1", "s2");
        findByIdMock.mockImplementation(async (id: string) => ({
            id,
            name: `Name ${id}`,
            role: "ADMIN",
        }));
        getAccessMock.mockResolvedValue(spaceAccess);
    });

    it("grants the lock and emits map_locked to the space room", async () => {
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);
        const ack = vi.fn();

        await handler(socket, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            ack
        );

        expect(ack).toHaveBeenCalledWith({
            ok: true,
            heartbeatMs: 15000,
            ttlMs: 45000,
        });
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "map_locked",
            expect.objectContaining({
                mapId: "map-1",
                by: { id: "u1", name: "Name u1" },
                since: expect.any(String),
            })
        );
    });

    it("uses the map room for a template", async () => {
        getAccessMock.mockResolvedValue(templateAccess);
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);

        await handler(socket, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            vi.fn()
        );

        expect(emitToRoomMock).toHaveBeenCalledWith(
            "map:map-1",
            "map_locked",
            expect.anything()
        );
    });

    it("denies another person with by and since", async () => {
        const a = createFakeSocket("sock-a", "u1");
        const b = createFakeSocket("sock-b", "u2");
        registerEditorAcquire(a as any);
        registerEditorAcquire(b as any);
        await handler(a, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            vi.fn()
        );
        const ack = vi.fn();

        await handler(b, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s2" },
            ack
        );

        expect(ack).toHaveBeenCalledWith({
            ok: false,
            code: "MAP_LOCKED",
            by: { id: "u1", name: "Name u1" },
            since: expect.any(String),
            mode: "map",
        });
    });

    it("answers FORBIDDEN without canEdit", async () => {
        getAccessMock.mockResolvedValue({ ...spaceAccess, canEdit: false });
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);
        const ack = vi.fn();

        await handler(socket, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            ack
        );

        expect(ack).toHaveBeenCalledWith({ ok: false, code: "FORBIDDEN" });
        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it("warns the old session when the same person takes over", async () => {
        const a = createFakeSocket("sock-a", "u1");
        const b = createFakeSocket("sock-b", "u1");
        registerEditorAcquire(a as any);
        registerEditorAcquire(b as any);
        await handler(a, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            vi.fn()
        );

        await handler(b, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s2" },
            vi.fn()
        );

        expect(emitToSocketMock).toHaveBeenCalledWith(
            "sock-a",
            "editor:lock_lost",
            { mapId: "map-1", reason: "TAKEN_OVER" }
        );
        expect(EditorSessions.get("s1")).toBeUndefined();
        expect(EditorSessions.get("s2")).toBe("sock-b");
    });

    it("does not crash on an invalid body", async () => {
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);
        registerEditorHeartbeat(socket as any);
        registerEditorRelease(socket as any);
        const ack = vi.fn();

        await handler(socket, "editor:acquire")?.({ mapId: 1 }, ack);
        await handler(socket, "editor:acquire")?.(undefined, undefined);
        await handler(socket, "editor:heartbeat")?.(null, ack);
        await handler(socket, "editor:release")?.("x", ack);

        expect(ack).toHaveBeenCalledWith({ ok: false, code: "FORBIDDEN" });
        expect(ack).toHaveBeenCalledWith({ ok: false });
    });

    it("heartbeat answers ok for the holder and ok:false otherwise", async () => {
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);
        registerEditorHeartbeat(socket as any);
        await handler(socket, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            vi.fn()
        );
        const okAck = vi.fn();
        const lostAck = vi.fn();

        await handler(socket, "editor:heartbeat")?.(
            { mapId: "map-1", sessionId: "s1" },
            okAck
        );
        await handler(socket, "editor:heartbeat")?.(
            { mapId: "map-1", sessionId: "other" },
            lostAck
        );

        expect(okAck).toHaveBeenCalledWith({ ok: true });
        expect(lostAck).toHaveBeenCalledWith({ ok: false });
    });

    it("release emits map_unlocked and frees the lock", async () => {
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);
        registerEditorRelease(socket as any);
        await handler(socket, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            vi.fn()
        );
        emitToRoomMock.mockClear();
        const ack = vi.fn();

        await handler(socket, "editor:release")?.(
            { mapId: "map-1", sessionId: "s1" },
            ack
        );

        expect(ack).toHaveBeenCalledWith({ ok: true });
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "map_unlocked",
            { mapId: "map-1", mode: "map" }
        );
        expect(MapLockService.get("map-1")).toBeFalsy();
    });

    it("disconnect clears the session mapping but keeps the lock", async () => {
        const socket = createFakeSocket("sock-1", "u1");
        registerEditorAcquire(socket as any);
        registerDisconnect(socket as any);
        await handler(socket, "editor:acquire")?.(
            { mapId: "map-1", sessionId: "s1" },
            vi.fn()
        );

        handler(socket, "disconnect")?.();

        expect(EditorSessions.get("s1")).toBeUndefined();
        expect(MapLockService.get("map-1")).toBeTruthy();
    });

    describe("decorator mode", () => {
        const memberAccess = {
            ...spaceAccess,
            canEdit: false,
            canDecorate: true,
        };

        it("lets a member open the decorator and announces the mode", async () => {
            getAccessMock.mockResolvedValue(memberAccess);
            const socket = createFakeSocket("sock-1", "u1");
            registerEditorAcquire(socket as any);
            const ack = vi.fn();

            await handler(socket, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                ack
            );

            expect(ack).toHaveBeenCalledWith(
                expect.objectContaining({ ok: true })
            );
            expect(MapLockService.get("map-1")?.mode).toBe("objects");
            expect(emitToRoomMock).toHaveBeenCalledWith(
                "space:space-1",
                "map_locked",
                expect.objectContaining({ mapId: "map-1", mode: "objects" })
            );
        });

        it("refuses the Studio to a member who cannot edit", async () => {
            getAccessMock.mockResolvedValue(memberAccess);
            const socket = createFakeSocket("sock-1", "u1");
            registerEditorAcquire(socket as any);
            const ack = vi.fn();

            await handler(socket, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "map" },
                ack
            );

            expect(ack).toHaveBeenCalledWith({ ok: false, code: "FORBIDDEN" });
        });

        it("refuses the decorator to someone who cannot decorate", async () => {
            getAccessMock.mockResolvedValue({
                ...memberAccess,
                canDecorate: false,
            });
            const socket = createFakeSocket("sock-1", "u1");
            registerEditorAcquire(socket as any);
            const ack = vi.fn();

            await handler(socket, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                ack
            );

            expect(ack).toHaveBeenCalledWith({ ok: false, code: "FORBIDDEN" });
        });

        it("refuses a second member with MAP_LOCKED and the mode", async () => {
            getAccessMock.mockResolvedValue(memberAccess);
            const a = createFakeSocket("sock-a", "u1");
            const b = createFakeSocket("sock-b", "u2");
            registerEditorAcquire(a as any);
            registerEditorAcquire(b as any);
            await handler(a, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                vi.fn()
            );
            const ack = vi.fn();

            await handler(b, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s2", mode: "objects" },
                ack
            );

            expect(ack).toHaveBeenCalledWith(
                expect.objectContaining({
                    ok: false,
                    code: "MAP_LOCKED",
                    mode: "objects",
                    by: { id: "u1", name: "Name u1" },
                })
            );
        });

        it("tells the decorator it lost the lock when the owner opens the Studio", async () => {
            const member = createFakeSocket("sock-a", "u1");
            const owner = createFakeSocket("sock-b", "u2");
            registerEditorAcquire(member as any);
            registerEditorAcquire(owner as any);
            getAccessMock.mockResolvedValue(memberAccess);
            await handler(member, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                vi.fn()
            );
            getAccessMock.mockResolvedValue(spaceAccess);
            const ack = vi.fn();

            await handler(owner, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s2", mode: "map" },
                ack
            );

            expect(ack).toHaveBeenCalledWith(
                expect.objectContaining({ ok: true })
            );
            expect(emitToSocketMock).toHaveBeenCalledWith(
                "sock-a",
                "editor:lock_lost",
                { mapId: "map-1", reason: "MAP_EDITING" }
            );
            expect(MapLockService.get("map-1")?.mode).toBe("map");
        });

        it("answers the heartbeat of a decorator by canDecorate, read again", async () => {
            getAccessMock.mockResolvedValue(memberAccess);
            const socket = createFakeSocket("sock-1", "u1");
            registerEditorAcquire(socket as any);
            registerEditorHeartbeat(socket as any);
            await handler(socket, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                vi.fn()
            );
            const alive = vi.fn();
            await handler(socket, "editor:heartbeat")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                alive
            );
            expect(alive).toHaveBeenCalledWith({ ok: true });

            getAccessMock.mockResolvedValue({
                ...memberAccess,
                canDecorate: false,
            });
            const gone = vi.fn();
            await handler(socket, "editor:heartbeat")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                gone
            );

            expect(gone).toHaveBeenCalledWith({ ok: false });
        });

        it("announces map_unlocked with the mode on release", async () => {
            getAccessMock.mockResolvedValue(memberAccess);
            const socket = createFakeSocket("sock-1", "u1");
            registerEditorAcquire(socket as any);
            registerEditorRelease(socket as any);
            await handler(socket, "editor:acquire")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                vi.fn()
            );
            emitToRoomMock.mockClear();

            await handler(socket, "editor:release")?.(
                { mapId: "map-1", sessionId: "s1", mode: "objects" },
                vi.fn()
            );

            expect(emitToRoomMock).toHaveBeenCalledWith(
                "space:space-1",
                "map_unlocked",
                { mapId: "map-1", mode: "objects" }
            );
        });
    });
});
