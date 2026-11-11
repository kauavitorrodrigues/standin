import { describe, expect, it } from "vitest";
import type { ListeningTrack } from "@standin/contracts";
import { INITIAL_LISTENING_STATE, listeningReducer } from "../listeningState";
import { getPlayingUserIds } from "../getPlayingUserIds";

const track = (overrides: Partial<ListeningTrack> = {}): ListeningTrack => ({
    trackId: "t1",
    title: "ALEXA 2",
    artists: ["LH CHUCRO"],
    coverUrl: null,
    url: "https://open.spotify.com/track/t1",
    isPlaying: true,
    ...overrides,
});

describe("listeningReducer", () => {
    it("starts from the snapshot of the join", () => {
        const state = listeningReducer(INITIAL_LISTENING_STATE, {
            type: "snapshot-received",
            entries: [
                { userId: "u1", track: track() },
                { userId: "u2", track: track({ trackId: "t2" }) },
            ],
        });

        expect(Object.keys(state)).toEqual(["u1", "u2"]);
    });

    it("replaces what an old snapshot held", () => {
        const before = { u1: track() };

        const state = listeningReducer(before, {
            type: "snapshot-received",
            entries: [{ userId: "u2", track: track() }],
        });

        expect(state).not.toHaveProperty("u1");
    });

    it("sets and changes the track of one person", () => {
        const first = listeningReducer(INITIAL_LISTENING_STATE, {
            type: "track-received",
            userId: "u1",
            track: track(),
        });
        const second = listeningReducer(first, {
            type: "track-received",
            userId: "u1",
            track: track({ trackId: "t2", isPlaying: false }),
        });

        expect(second.u1.trackId).toBe("t2");
        expect(second.u1.isPlaying).toBe(false);
    });

    it("clears one person on a null track and keeps the others", () => {
        const before = { u1: track(), u2: track() };

        const state = listeningReducer(before, {
            type: "track-received",
            userId: "u1",
            track: null,
        });

        expect(Object.keys(state)).toEqual(["u2"]);
    });

    it("returns the same state when a person who plays nothing is cleared", () => {
        const before = { u2: track() };

        expect(
            listeningReducer(before, {
                type: "track-received",
                userId: "u1",
                track: null,
            })
        ).toBe(before);
    });

    it("drops everyone on a reset", () => {
        expect(listeningReducer({ u1: track() }, { type: "reset" })).toEqual(
            {}
        );
    });
});

describe("getPlayingUserIds", () => {
    it("lists only the people whose music plays, not the paused ones", () => {
        const ids = getPlayingUserIds({
            u1: track({ isPlaying: true }),
            u2: track({ isPlaying: false }),
        });

        expect([...ids]).toEqual(["u1"]);
    });
});
