import { describe, expect, it } from "vitest";
import type { ListeningTrack } from "@standin/contracts";
import { hasTrackChanged } from "../hasTrackChanged";

const track = (patch: Partial<ListeningTrack> = {}): ListeningTrack => ({
    trackId: "t1",
    title: "ALEXA 2",
    artists: ["LH CHUCRO"],
    coverUrl: null,
    url: "https://open.spotify.com/track/t1",
    isPlaying: true,
    ...patch,
});

describe("hasTrackChanged", () => {
    it("is false when nothing plays before and after", () => {
        expect(hasTrackChanged(null, null)).toBe(false);
    });

    it("is true when a track appears or goes away", () => {
        expect(hasTrackChanged(null, track())).toBe(true);
        expect(hasTrackChanged(track(), null)).toBe(true);
    });

    it("is false when the same track is polled again", () => {
        expect(hasTrackChanged(track(), track())).toBe(false);
    });

    it("is true for another track", () => {
        expect(hasTrackChanged(track(), track({ trackId: "t2" }))).toBe(true);
    });

    it("is true when the music pauses or resumes", () => {
        expect(hasTrackChanged(track(), track({ isPlaying: false }))).toBe(
            true
        );
        expect(hasTrackChanged(track({ isPlaying: false }), track())).toBe(
            true
        );
    });
});
