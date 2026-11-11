import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ListeningTrack } from "@standin/contracts";

const { emitToRoomMock } = vi.hoisted(() => ({ emitToRoomMock: vi.fn() }));

vi.mock("../../../socketManager", () => ({
    SocketManager: { emitToRoom: emitToRoomMock },
}));

import { ListeningSync } from "../ListeningSync";

const track = (patch: Partial<ListeningTrack> = {}): ListeningTrack => ({
    trackId: "t1",
    title: "ALEXA 2",
    artists: ["LH CHUCRO"],
    coverUrl: null,
    url: "https://open.spotify.com/track/t1",
    isPlaying: true,
    ...patch,
});

beforeEach(() => {
    vi.clearAllMocks();
    ListeningSync.clear();
});

describe("ListeningSync.update", () => {
    it("tells the space when a track appears", () => {
        ListeningSync.update("s1", "u1", track(), 1000);

        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:s1",
            "space:music-listening",
            { userId: "u1", track: track() }
        );
    });

    it("sends nothing when the same track is polled again", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.update("s1", "u1", track(), 11_000);

        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("tells the space when the track changes", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.update("s1", "u1", track({ trackId: "t2" }), 2000);

        expect(emitToRoomMock).toHaveBeenCalledTimes(2);
    });

    it("tells the space when the music pauses and resumes", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.update("s1", "u1", track({ isPlaying: false }), 2000);
        ListeningSync.update("s1", "u1", track(), 3000);

        expect(emitToRoomMock).toHaveBeenCalledTimes(3);
    });

    it("clears the widget with a null track when nothing plays", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.update("s1", "u1", null, 2000);

        expect(emitToRoomMock).toHaveBeenLastCalledWith(
            "space:s1",
            "space:music-listening",
            { userId: "u1", track: null }
        );
    });

    it("tells nobody when nothing plays and nothing was shown", () => {
        ListeningSync.update("s1", "u1", null, 1000);

        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it("hides a track paused for too long, once", () => {
        const paused = track({ isPlaying: false });
        ListeningSync.update("s1", "u1", paused, 0);
        ListeningSync.update("s1", "u1", paused, 10 * 60_000);
        ListeningSync.update("s1", "u1", paused, 11 * 60_000);

        expect(emitToRoomMock).toHaveBeenCalledTimes(2);
        expect(emitToRoomMock).toHaveBeenLastCalledWith(
            "space:s1",
            "space:music-listening",
            { userId: "u1", track: null }
        );
    });
});

describe("ListeningSync.snapshot", () => {
    it("lists what is shown in the space for a person who joins", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.update("s2", "u2", track({ trackId: "t9" }), 1000);

        expect(ListeningSync.snapshot("s1")).toEqual([
            { userId: "u1", track: track() },
        ]);
    });

    it("leaves out a person whose track is hidden", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.clearUser("s1", "u1");

        expect(ListeningSync.snapshot("s1")).toEqual([]);
    });

    it("drops the state of a space nobody is in", () => {
        ListeningSync.update("s1", "u1", track(), 1000);
        ListeningSync.prune([]);

        expect(ListeningSync.snapshot("s1")).toEqual([]);
    });
});
