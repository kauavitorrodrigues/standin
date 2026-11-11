import { describe, expect, it } from "vitest";
import type { ListeningTrack } from "@standin/contracts";
import { resolveShownTrack } from "../resolveShownTrack";

const LIMIT = 60_000;

const track = (patch: Partial<ListeningTrack> = {}): ListeningTrack => ({
    trackId: "t1",
    title: "ALEXA 2",
    artists: ["LH CHUCRO"],
    coverUrl: null,
    url: "https://open.spotify.com/track/t1",
    isPlaying: true,
    ...patch,
});

describe("resolveShownTrack", () => {
    it("shows a track that plays", () => {
        const result = resolveShownTrack({
            track: track(),
            previous: null,
            now: 1000,
            pauseLimitMs: LIMIT,
        });

        expect(result).toEqual({
            visible: track(),
            trackId: "t1",
            pausedSince: null,
        });
    });

    it("shows nothing when nothing plays", () => {
        const result = resolveShownTrack({
            track: null,
            previous: { visible: track(), trackId: "t1", pausedSince: null },
            now: 1000,
            pauseLimitMs: LIMIT,
        });

        expect(result).toEqual({
            visible: null,
            trackId: null,
            pausedSince: null,
        });
    });

    it("keeps a paused track and starts counting the pause", () => {
        const paused = track({ isPlaying: false });
        const result = resolveShownTrack({
            track: paused,
            previous: { visible: track(), trackId: "t1", pausedSince: null },
            now: 5000,
            pauseLimitMs: LIMIT,
        });

        expect(result).toEqual({
            visible: paused,
            trackId: "t1",
            pausedSince: 5000,
        });
    });

    it("hides a track paused for the whole limit", () => {
        const paused = track({ isPlaying: false });
        const result = resolveShownTrack({
            track: paused,
            previous: { visible: paused, trackId: "t1", pausedSince: 5000 },
            now: 5000 + LIMIT,
            pauseLimitMs: LIMIT,
        });

        expect(result.visible).toBeNull();
        expect(result.pausedSince).toBe(5000);
    });

    it("keeps a long pause hidden on the next poll", () => {
        const paused = track({ isPlaying: false });
        const result = resolveShownTrack({
            track: paused,
            previous: { visible: null, trackId: "t1", pausedSince: 5000 },
            now: 5000 + LIMIT * 2,
            pauseLimitMs: LIMIT,
        });

        expect(result.visible).toBeNull();
    });

    it("shows the track again when the music resumes", () => {
        const result = resolveShownTrack({
            track: track(),
            previous: { visible: null, trackId: "t1", pausedSince: 5000 },
            now: 5000 + LIMIT * 2,
            pauseLimitMs: LIMIT,
        });

        expect(result.visible).toEqual(track());
        expect(result.pausedSince).toBeNull();
    });

    it("counts a pause again for another track", () => {
        const other = track({ trackId: "t2", isPlaying: false });
        const result = resolveShownTrack({
            track: other,
            previous: { visible: null, trackId: "t1", pausedSince: 5000 },
            now: 5000 + LIMIT * 2,
            pauseLimitMs: LIMIT,
        });

        expect(result.visible).toEqual(other);
        expect(result.pausedSince).toBe(5000 + LIMIT * 2);
    });
});
