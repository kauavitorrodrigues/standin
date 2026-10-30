import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    findPlayable: vi.fn(),
    resolveOrg: vi.fn(),
    setActive: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    SoundboardService: { findPlayable: mocks.findPlayable },
}));
vi.mock("../../services/resolveSpaceOrganizationId", () => ({
    resolveSpaceOrganizationId: mocks.resolveOrg,
}));
vi.mock("@/lib/soundboard/setSoundboardActive", () => ({
    setSoundboardActive: mocks.setActive,
}));

import { registerSoundboard } from "../soundboard";

type Handler = (payload: unknown, ack: (r: unknown) => void) => unknown;

const createSocket = (data: Record<string, unknown>) => {
    const handlers = new Map<string, Handler>();
    return {
        id: "s-1",
        connected: true,
        data,
        on: (event: string, handler: Handler) => handlers.set(event, handler),
        handlers,
    };
};

const createIo = () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    return { io: { to } as never, to, emit };
};

const member = { userId: "u-1", spaceId: "space-1" };
const CLIP = { id: "c-1", name: "Aplausos", durationMs: 2000 };

const play = async (
    socket: ReturnType<typeof createSocket>,
    clipId = "c-1"
) => {
    const ack = vi.fn();
    await socket.handlers.get("soundboard:play")!({ clipId }, ack);
    return ack;
};

describe("registerSoundboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.resolveOrg.mockResolvedValue("org-1");
        mocks.findPlayable.mockResolvedValue(CLIP);
    });

    it("starts the clip, flags the media and tells the space", async () => {
        const socket = createSocket(member);
        const { io, to, emit } = createIo();
        registerSoundboard(io, socket as never);

        const ack = await play(socket);

        expect(mocks.findPlayable).toHaveBeenCalledWith("c-1", "org-1");
        expect(mocks.setActive).toHaveBeenCalledWith("space-1", "s-1", true);
        expect(to).toHaveBeenCalledWith("space:space-1");
        expect(emit).toHaveBeenCalledWith("soundboard:started", {
            playId: expect.any(String),
            userId: "u-1",
            clipId: "c-1",
            name: "Aplausos",
            durationMs: 2000,
        });
        expect(ack).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
    });

    it("refuses a guest and a socket outside a space", async () => {
        for (const data of [
            { ...member, isGuest: true },
            { userId: "u-1", spaceId: null },
        ]) {
            const socket = createSocket(data);
            registerSoundboard(createIo().io, socket as never);

            const ack = await play(socket);

            expect(ack).toHaveBeenCalledWith({
                ok: false,
                code: "SOUNDBOARD_NOT_IN_SPACE",
            });
        }
        expect(mocks.findPlayable).not.toHaveBeenCalled();
    });

    it("answers a clip that is not visible, or a bad payload, as not found", async () => {
        const { SoundboardClipNotFoundError } =
            await import("@standin/contracts");
        mocks.findPlayable.mockRejectedValue(new SoundboardClipNotFoundError());
        const socket = createSocket(member);
        registerSoundboard(createIo().io, socket as never);

        expect(await play(socket)).toHaveBeenCalledWith({
            ok: false,
            code: "SOUNDBOARD_CLIP_NOT_FOUND",
        });
        const ack = vi.fn();
        await socket.handlers.get("soundboard:play")!({}, ack);
        expect(ack).toHaveBeenCalledWith({
            ok: false,
            code: "SOUNDBOARD_CLIP_NOT_FOUND",
        });
    });

    it("blocks a second play inside the cooldown and says how long", async () => {
        const socket = createSocket(member);
        const { io, emit } = createIo();
        registerSoundboard(io, socket as never);
        await play(socket);
        emit.mockClear();

        const ack = await play(socket);

        expect(ack).toHaveBeenCalledWith(
            expect.objectContaining({
                ok: false,
                code: "SOUNDBOARD_COOLDOWN",
                retryAfterMs: expect.any(Number),
            })
        );
        expect(emit).not.toHaveBeenCalled();
    });

    it("ignores a stop that names a play that is not running", async () => {
        const socket = createSocket(member);
        const { io, emit } = createIo();
        registerSoundboard(io, socket as never);
        await play(socket);
        emit.mockClear();

        const ack = vi.fn();
        socket.handlers.get("soundboard:stop")!({ playId: "old" }, ack);

        expect(emit).not.toHaveBeenCalled();
        expect(mocks.setActive).not.toHaveBeenCalledWith(
            "space-1",
            "s-1",
            false
        );
        expect(ack).toHaveBeenCalledWith({ ok: true });
    });

    it("drops a play when the socket left while the clip was looked up", async () => {
        const socket = createSocket({ ...member, connected: false });
        const live = Object.assign(socket, { connected: false });
        registerSoundboard(createIo().io, live as never);

        const ack = await play(live);

        expect(ack).toHaveBeenCalledWith({
            ok: false,
            code: "SOUNDBOARD_NOT_IN_SPACE",
        });
        expect(mocks.setActive).not.toHaveBeenCalled();
    });

    it("stops a play on request and tells the space", async () => {
        const socket = createSocket(member);
        const { io, emit } = createIo();
        registerSoundboard(io, socket as never);
        const started = await play(socket);
        const { playId } = started.mock.calls[0]![0].clip;

        const ack = vi.fn();
        socket.handlers.get("soundboard:stop")!({ playId }, ack);

        expect(mocks.setActive).toHaveBeenLastCalledWith(
            "space-1",
            "s-1",
            false
        );
        expect(emit).toHaveBeenLastCalledWith("soundboard:stopped", {
            playId,
            userId: "u-1",
            clipId: "c-1",
        });
        expect(ack).toHaveBeenCalledWith({ ok: true });
    });

    describe("with clips overlapping", () => {
        beforeEach(() => {
            vi.useFakeTimers({ toFake: ["Date"] });
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        const playAfterCooldown = async (
            socket: ReturnType<typeof createSocket>
        ) => {
            vi.advanceTimersByTime(500);
            return play(socket);
        };

        it("keeps the media flag on until the last clip stops", async () => {
            const socket = createSocket(member);
            registerSoundboard(createIo().io, socket as never);
            const first = await play(socket);
            const second = await playAfterCooldown(socket);
            mocks.setActive.mockClear();

            const stop = socket.handlers.get("soundboard:stop")!;
            stop({ playId: first.mock.calls[0]![0].clip.playId }, vi.fn());
            expect(mocks.setActive).not.toHaveBeenCalled();

            stop({ playId: second.mock.calls[0]![0].clip.playId }, vi.fn());
            expect(mocks.setActive).toHaveBeenCalledWith(
                "space-1",
                "s-1",
                false
            );
        });

        it("refuses a fifth clip while four are playing", async () => {
            const socket = createSocket(member);
            registerSoundboard(createIo().io, socket as never);
            for (let index = 0; index < 4; index += 1) {
                expect(await playAfterCooldown(socket)).toHaveBeenCalledWith(
                    expect.objectContaining({ ok: true })
                );
            }

            const ack = await playAfterCooldown(socket);

            expect(ack).toHaveBeenCalledWith({
                ok: false,
                code: "SOUNDBOARD_TOO_MANY_CLIPS",
            });
        });

        it("tells the space about every clip when the socket leaves", async () => {
            const socket = createSocket(member);
            const { io, emit } = createIo();
            registerSoundboard(io, socket as never);
            await play(socket);
            await playAfterCooldown(socket);
            emit.mockClear();

            socket.handlers.get("disconnect")!(undefined, vi.fn());

            expect(emit).toHaveBeenCalledTimes(2);
            expect(emit).toHaveBeenCalledWith(
                "soundboard:stopped",
                expect.objectContaining({ userId: "u-1" })
            );
        });
    });
});
