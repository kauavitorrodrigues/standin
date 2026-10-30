import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { SOUNDBOARD_COOLDOWN_MS } from "@standin/contracts";
import type { SoundboardPlayAck, SoundboardStopped } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import type { ClipStart } from "@/features/media-devices/types/clipStart";
import type { SocketHandlers } from "../../types/space";

const mocks = vi.hoisted(() => {
    const handlers: SocketHandlers = { stopped: null, reset: null };
    return { handlers, emitPlay: vi.fn(), emitStop: vi.fn(), toast: vi.fn() };
});

vi.mock("../../lib/emitPlay", () => ({ emitPlay: mocks.emitPlay }));
vi.mock("../../lib/emitStop", () => ({ emitStop: mocks.emitStop }));
vi.mock("../../lib/onStopped", () => ({
    onStopped: (listener: (event: SoundboardStopped) => void) => {
        mocks.handlers.stopped = listener;
        return () => undefined;
    },
}));
vi.mock("../../lib/onConnectionReset", () => ({
    onConnectionReset: (listener: () => void) => {
        mocks.handlers.reset = listener;
        return () => undefined;
    },
}));
vi.mock("../../lib/clipBufferCache", () => ({
    getClipBuffer: () => Promise.resolve({}),
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: mocks.toast } }));

import { useSpaceSoundboard } from "../useSpaceSoundboard";

const CLIP_A = { id: "a", fileUrl: "/files/a", volume: 1 };
const CLIP_B = { id: "b", fileUrl: "/files/b", volume: 0.5 };

const createPlayer = () => ({
    playClip: vi.fn<(start: ClipStart) => boolean>(() => true),
    stopClip: vi.fn<(playId: string) => void>(),
    stopAllClips: vi.fn(),
});

const started = (playId: string, clipId: string): SoundboardPlayAck => ({
    ok: true,
    clip: { playId, userId: "me", clipId, name: clipId, durationMs: 1000 },
});

describe("useSpaceSoundboard", () => {
    let player: ReturnType<typeof createPlayer>;
    let playCount = 0;

    const mount = (
        overrides: { micError?: "denied" | null; isHeadphonesOn?: boolean } = {}
    ) =>
        renderHook(() =>
            useSpaceSoundboard({
                player,
                micError: overrides.micError ?? null,
                hasMicStream: true,
                isHeadphonesOn: overrides.isHeadphonesOn ?? false,
            })
        );

    // Each play is a click a little after the last, past the client cooldown.
    const playOf = async (
        result: { current: { play: (clip: typeof CLIP_A) => Promise<void> } },
        clip: typeof CLIP_A
    ) => {
        vi.setSystemTime(Date.now() + SOUNDBOARD_COOLDOWN_MS + 1);
        await act(() => result.current.play(clip));
    };

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(1_000_000);
        player = createPlayer();
        playCount = 0;
        mocks.emitPlay.mockReset();
        mocks.emitStop.mockReset();
        mocks.toast.mockReset();
        mocks.emitPlay.mockImplementation((clipId: string) => {
            playCount += 1;
            return Promise.resolve(started(`play-${playCount}`, clipId));
        });
        mocks.emitStop.mockImplementation(() => Promise.resolve({ ok: true }));
    });

    afterEach(() => {
        unmountAllHooks();
        vi.useRealTimers();
    });

    it("starts a play with the id the server gave it and the volume of the clip", async () => {
        const { result } = mount();

        await playOf(result, CLIP_B);

        const start = player.playClip.mock.calls.at(0)?.at(0);
        expect(start?.playId).toBe("play-1");
        expect(start?.volume).toBe(0.5);
    });

    it("lets plays overlap, the same clip included, none replacing another", async () => {
        const { result } = mount();

        await playOf(result, CLIP_A);
        await playOf(result, CLIP_A);
        await playOf(result, CLIP_B);

        expect(player.playClip).toHaveBeenCalledTimes(3);
        expect(player.stopClip).not.toHaveBeenCalled();
        expect([...result.current.playingClipIds].sort()).toEqual(["a", "b"]);
    });

    it("keeps a clip playing while one of its plays still runs", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);
        await playOf(result, CLIP_A);
        const first = player.playClip.mock.calls.at(0)?.at(0);

        act(() => first?.onEnded?.());

        expect(result.current.playingClipIds.has("a")).toBe(true);
    });

    it("tells the server which play ended by itself", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);
        await playOf(result, CLIP_B);
        const second = player.playClip.mock.calls.at(1)?.at(0);

        act(() => second?.onEnded?.());

        expect(mocks.emitStop).toHaveBeenCalledWith("play-2");
        expect(mocks.emitStop).toHaveBeenCalledTimes(1);
        expect([...result.current.playingClipIds]).toEqual(["a"]);
    });

    it("stops a play of ours that the server stopped", async () => {
        const { result } = mount();
        await playOf(result, CLIP_B);

        act(() =>
            mocks.handlers.stopped?.({
                playId: "play-1",
                userId: "me",
                clipId: "b",
            })
        );

        expect(player.stopClip).toHaveBeenCalledWith("play-1");
        expect(result.current.playingClipIds.size).toBe(0);
    });

    it("ignores a stop with a play id that is not ours", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);

        act(() =>
            mocks.handlers.stopped?.({
                playId: "someone-elses",
                userId: "other",
                clipId: "a",
            })
        );

        expect(player.stopClip).not.toHaveBeenCalled();
        expect(result.current.playingClipIds.has("a")).toBe(true);
    });

    it("ignores a stop of a play that already ended here", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);
        const start = player.playClip.mock.calls.at(0)?.at(0);
        act(() => start?.onEnded?.());

        act(() =>
            mocks.handlers.stopped?.({
                playId: "play-1",
                userId: "me",
                clipId: "a",
            })
        );

        expect(player.stopClip).not.toHaveBeenCalled();
    });

    it("ignores a stop when nothing is playing", () => {
        mount();

        act(() =>
            mocks.handlers.stopped?.({
                playId: "play-1",
                userId: "me",
                clipId: "a",
            })
        );

        expect(player.stopClip).not.toHaveBeenCalled();
    });

    it("stops all the plays when the socket drops or reconnects", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);
        await playOf(result, CLIP_B);

        act(() => mocks.handlers.reset?.());

        expect(player.stopAllClips).toHaveBeenCalledTimes(1);
        expect(result.current.playingClipIds.size).toBe(0);
        expect(mocks.emitStop).not.toHaveBeenCalled();
    });

    it("does nothing on a reset with no plays", () => {
        mount();

        act(() => mocks.handlers.reset?.());

        expect(player.stopAllClips).not.toHaveBeenCalled();
    });

    it("tells the server when the mixer could not start the play", async () => {
        player.playClip.mockImplementation(() => false);
        const { result } = mount();

        await playOf(result, CLIP_A);

        expect(mocks.emitStop).toHaveBeenCalledWith("play-1");
        expect(result.current.playingClipIds.size).toBe(0);
    });

    it("is not at the limit below four plays", async () => {
        const { result } = mount();
        for (const clip of [CLIP_A, CLIP_A, CLIP_B]) {
            await playOf(result, clip);
        }

        expect(result.current.isAtLimit).toBe(false);
    });

    it("is at the limit at four plays, with no reason to show", async () => {
        const { result } = mount();
        for (const clip of [CLIP_A, CLIP_A, CLIP_B, CLIP_B]) {
            await playOf(result, clip);
        }

        expect(result.current.isAtLimit).toBe(true);
        expect(result.current.disabledReason).toBeNull();
    });

    it("is free again the moment any play ends", async () => {
        const { result } = mount();
        for (const clip of [CLIP_A, CLIP_A, CLIP_B, CLIP_B]) {
            await playOf(result, clip);
        }
        const third = player.playClip.mock.calls.at(2)?.at(0);

        act(() => third?.onEnded?.());

        expect(result.current.isAtLimit).toBe(false);
    });

    it("plays again after a slot is freed", async () => {
        const { result } = mount();
        for (const clip of [CLIP_A, CLIP_A, CLIP_B, CLIP_B]) {
            await playOf(result, clip);
        }
        act(() => player.playClip.mock.calls.at(0)?.at(0)?.onEnded?.());

        await playOf(result, CLIP_A);

        expect(mocks.emitPlay).toHaveBeenCalledTimes(5);
    });

    it("does not ask the server for a fifth play, and says nothing", async () => {
        const { result } = mount();
        for (const clip of [CLIP_A, CLIP_A, CLIP_B, CLIP_B]) {
            await playOf(result, clip);
        }

        await playOf(result, CLIP_A);

        expect(mocks.emitPlay).toHaveBeenCalledTimes(4);
        expect(mocks.toast).not.toHaveBeenCalled();
    });

    it("drops a click inside the cooldown, with no message", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);

        await act(() => result.current.play(CLIP_B));

        expect(mocks.emitPlay).toHaveBeenCalledTimes(1);
        expect(mocks.toast).not.toHaveBeenCalled();
    });

    it("plays again once the cooldown is over", async () => {
        const { result } = mount();
        await playOf(result, CLIP_A);

        await playOf(result, CLIP_B);

        expect(mocks.emitPlay).toHaveBeenCalledTimes(2);
    });

    it("says nothing when the server still answers with the cooldown", async () => {
        mocks.emitPlay.mockImplementation(() =>
            Promise.resolve({
                ok: false,
                code: "SOUNDBOARD_COOLDOWN",
                retryAfterMs: 100,
            })
        );
        const { result } = mount();

        await playOf(result, CLIP_A);

        expect(mocks.toast).not.toHaveBeenCalled();
        expect(player.playClip).not.toHaveBeenCalled();
    });

    it("shows no toast when the server answers that there are too many", async () => {
        mocks.emitPlay.mockImplementation(() =>
            Promise.resolve({ ok: false, code: "SOUNDBOARD_TOO_MANY_CLIPS" })
        );
        const { result } = mount();

        await playOf(result, CLIP_A);

        expect(mocks.toast).not.toHaveBeenCalled();
        expect(player.playClip).not.toHaveBeenCalled();
    });

    it("does not play while a reason disables it", async () => {
        const { result } = mount({ micError: "denied" });

        await playOf(result, CLIP_A);

        expect(mocks.emitPlay).not.toHaveBeenCalled();
    });
});
