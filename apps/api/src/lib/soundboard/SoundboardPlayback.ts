import { randomUUID } from "node:crypto";
import {
    SOUNDBOARD_COOLDOWN_MS,
    SOUNDBOARD_MAX_CONCURRENT_CLIPS,
    SoundboardCooldownError,
    SoundboardTooManyClipsError,
} from "@standin/contracts";
import { COOLDOWN_PRUNE_THRESHOLD, PLAYBACK_GRACE_MS } from "./consts";
import type {
    ActivePlay,
    PlaybackClock,
    PlaybackEndedListener,
    PlaybackEntry,
    PlaybackStart,
} from "./types";

const realClock: PlaybackClock = {
    now: () => Date.now(),
    setTimer: (run, delayMs) => setTimeout(run, delayMs),
    clearTimer: (handle) => clearTimeout(handle as NodeJS.Timeout),
    newId: () => randomUUID(),
};

const toActivePlay = ({
    playId,
    spaceId,
    userId,
    clipId,
}: PlaybackEntry): ActivePlay => ({ playId, spaceId, userId, clipId });

/**
 * Who plays which clips, the most clips at once and the cooldown between
 * plays. The state lives on the server because the client is never trusted.
 * Clips overlap, the same one included, each play with its own id. The audio
 * itself never touches this, it rides the microphone track of the person.
 */
export class SoundboardPlayback {
    private readonly active = new Map<string, Map<string, PlaybackEntry>>();
    // The start of the last play of each person, by user id so reconnecting
    // with a new socket does not skip the wait.
    private readonly lastStartedAt = new Map<string, number>();

    constructor(
        private readonly onEnded: PlaybackEndedListener,
        private readonly clock: PlaybackClock = realClock,
        private readonly cooldownMs: number = SOUNDBOARD_COOLDOWN_MS,
        private readonly maxConcurrent: number = SOUNDBOARD_MAX_CONCURRENT_CLIPS
    ) {}

    /**
     * Starts a play. Throws the cooldown error with the wait that is left, or
     * the too many clips error when the person already has the most playing.
     */
    start({
        spaceId,
        socketId,
        userId,
        clipId,
        durationMs,
    }: PlaybackStart): ActivePlay {
        const now = this.clock.now();
        const waited = now - (this.lastStartedAt.get(userId) ?? -Infinity);
        if (waited < this.cooldownMs) {
            throw new SoundboardCooldownError(this.cooldownMs - waited);
        }
        if (this.countOf(socketId) >= this.maxConcurrent) {
            throw new SoundboardTooManyClipsError();
        }

        this.lastStartedAt.set(userId, now);
        this.pruneCooldowns(now);

        const playId = this.clock.newId();
        const timer = this.clock.setTimer(() => {
            const play = this.stop(socketId, playId);
            if (play) this.onEnded(socketId, play);
        }, durationMs + PLAYBACK_GRACE_MS);

        const entry: PlaybackEntry = { playId, spaceId, userId, clipId, timer };
        const plays = this.active.get(socketId) ?? new Map();
        plays.set(playId, entry);
        this.active.set(socketId, plays);

        return toActivePlay(entry);
    }

    /** Stops one play of the socket. Null when it is not playing (any more). */
    stop(socketId: string, playId: string): ActivePlay | null {
        const plays = this.active.get(socketId);
        const entry = plays?.get(playId);
        if (!plays || !entry) return null;

        this.clock.clearTimer(entry.timer);
        plays.delete(playId);
        if (plays.size === 0) this.active.delete(socketId);
        return toActivePlay(entry);
    }

    /** Stops everything the socket plays, e.g. when it disconnects. */
    stopAll(socketId: string): ActivePlay[] {
        const plays = [...(this.active.get(socketId)?.keys() ?? [])];
        return plays.flatMap((playId) => {
            const play = this.stop(socketId, playId);
            return play ? [play] : [];
        });
    }

    /** How many clips the socket has playing right now. */
    countOf(socketId: string): number {
        return this.active.get(socketId)?.size ?? 0;
    }

    private pruneCooldowns(now: number): void {
        if (this.lastStartedAt.size < COOLDOWN_PRUNE_THRESHOLD) return;

        this.lastStartedAt.forEach((startedAt, userId) => {
            if (now - startedAt >= this.cooldownMs) {
                this.lastStartedAt.delete(userId);
            }
        });
    }
}
