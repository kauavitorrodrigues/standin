import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    SoundboardCooldownError,
    SoundboardTooManyClipsError,
} from "@standin/contracts";
import { SoundboardPlayback } from "../SoundboardPlayback";
import { PLAYBACK_GRACE_MS } from "../consts";
import type { PlaybackClock } from "../types";

const COOLDOWN = 400;
const MAX = 4;

const createClock = () => {
    let now = 1_000_000;
    let nextHandle = 1;
    let nextId = 1;
    const timers = new Map<number, { at: number; run: () => void }>();
    const clock: PlaybackClock = {
        now: () => now,
        setTimer: (run, delayMs) => {
            const handle = nextHandle++;
            timers.set(handle, { at: now + delayMs, run });
            return handle;
        },
        clearTimer: (handle) => timers.delete(handle as number),
        newId: () => `play-${nextId++}`,
    };
    const advance = (ms: number) => {
        now += ms;
        [...timers.entries()]
            .filter(([, timer]) => timer.at <= now)
            .forEach(([handle, timer]) => {
                timers.delete(handle);
                timer.run();
            });
    };
    return { clock, advance, pending: () => timers.size };
};

const play = (overrides: Record<string, unknown> = {}) => ({
    spaceId: "space-1",
    socketId: "s-1",
    userId: "u-1",
    clipId: "c-1",
    durationMs: 3000,
    ...overrides,
});

describe("SoundboardPlayback", () => {
    const onEnded = vi.fn();
    let env: ReturnType<typeof createClock>;
    let playback: SoundboardPlayback;

    beforeEach(() => {
        onEnded.mockClear();
        env = createClock();
        playback = new SoundboardPlayback(onEnded, env.clock, COOLDOWN, MAX);
    });

    it("gives each play an id and ends it after the clip", () => {
        const started = playback.start(play());
        expect(started.playId).toBe("play-1");
        expect(playback.countOf("s-1")).toBe(1);

        env.advance(3000 + PLAYBACK_GRACE_MS - 1);
        expect(onEnded).not.toHaveBeenCalled();

        env.advance(1);
        expect(onEnded).toHaveBeenCalledWith("s-1", started);
        expect(playback.countOf("s-1")).toBe(0);
    });

    it("lets clips overlap, the same clip included", () => {
        playback.start(play());
        env.advance(COOLDOWN);
        playback.start(play({ clipId: "c-2" }));
        env.advance(COOLDOWN);
        playback.start(play());

        expect(playback.countOf("s-1")).toBe(3);
        expect(env.pending()).toBe(3);
    });

    it("refuses a play past the most clips at once, until one ends", () => {
        for (let index = 0; index < MAX; index += 1) {
            playback.start(play({ clipId: `c-${index}` }));
            env.advance(COOLDOWN);
        }

        expect(() => playback.start(play())).toThrow(
            SoundboardTooManyClipsError
        );

        env.advance(3000 + PLAYBACK_GRACE_MS);
        expect(() => playback.start(play())).not.toThrow();
    });

    it("counts the plays of each socket on their own", () => {
        for (let index = 0; index < MAX; index += 1) {
            playback.start(play());
            env.advance(COOLDOWN);
        }

        expect(() =>
            playback.start(play({ socketId: "s-2", userId: "u-2" }))
        ).not.toThrow();
    });

    it("refuses a second play inside the cooldown with the wait left", () => {
        playback.start(play());
        env.advance(100);

        try {
            playback.start(play({ clipId: "c-2" }));
            expect.unreachable();
        } catch (error) {
            expect(error).toBeInstanceOf(SoundboardCooldownError);
            expect((error as SoundboardCooldownError).retryAfterMs).toBe(300);
        }
    });

    it("applies the cooldown per person, not per socket", () => {
        playback.start(play());

        expect(() => playback.start(play({ socketId: "s-new" }))).toThrow(
            SoundboardCooldownError
        );
        expect(() =>
            playback.start(play({ socketId: "s-2", userId: "u-2" }))
        ).not.toThrow();
    });

    it("stops only the play it is told to, so a late stop is harmless", () => {
        const first = playback.start(play());
        env.advance(COOLDOWN);
        const second = playback.start(play());

        expect(playback.stop("s-1", "unknown")).toBeNull();
        expect(playback.stop("s-1", first.playId)).toEqual(first);
        expect(playback.stop("s-1", first.playId)).toBeNull();
        expect(playback.countOf("s-1")).toBe(1);
        expect(playback.stop("s-1", second.playId)).toEqual(second);
        expect(env.pending()).toBe(0);
    });

    it("stops everything of a socket when it leaves", () => {
        playback.start(play());
        env.advance(COOLDOWN);
        playback.start(play({ clipId: "c-2" }));

        const stopped = playback.stopAll("s-1");

        expect(stopped.map(({ clipId }) => clipId)).toEqual(["c-1", "c-2"]);
        expect(playback.countOf("s-1")).toBe(0);
        expect(env.pending()).toBe(0);
        expect(playback.stopAll("s-1")).toEqual([]);
    });
});
