import { describe, expect, it } from "vitest";
import type { PlaysByPlayId } from "../../types/playback";
import { collectClipIds } from "../collectClipIds";
import { stopsLocalPlay } from "../stopsLocalPlay";
import { withoutPlay } from "../withoutPlay";
import { withPlay } from "../withPlay";

const NONE: PlaysByPlayId = new Map();

describe("withPlay and withoutPlay", () => {
    it("adds a play without touching the original", () => {
        const next = withPlay(NONE, "p1", "clip-a");

        expect(next.get("p1")).toBe("clip-a");
        expect(NONE.size).toBe(0);
    });

    it("keeps the other plays", () => {
        const next = withPlay(withPlay(NONE, "p1", "clip-a"), "p2", "clip-b");

        expect([...next.keys()]).toEqual(["p1", "p2"]);
    });

    it("takes one play out and leaves the rest", () => {
        const plays = withPlay(withPlay(NONE, "p1", "clip-a"), "p2", "clip-b");

        expect([...withoutPlay(plays, "p1").keys()]).toEqual(["p2"]);
        expect(plays.size).toBe(2);
    });

    it("gives back the same plays when the one to take out is not there", () => {
        const plays = withPlay(NONE, "p1", "clip-a");

        expect(withoutPlay(plays, "unknown")).toBe(plays);
    });
});

describe("collectClipIds", () => {
    it("lists the clips that have a play running", () => {
        const plays = withPlay(withPlay(NONE, "p1", "a"), "p2", "b");

        expect([...collectClipIds(plays)].sort()).toEqual(["a", "b"]);
    });

    it("counts a clip that plays twice as one", () => {
        const plays = withPlay(withPlay(NONE, "p1", "a"), "p2", "a");

        expect(collectClipIds(plays).size).toBe(1);
    });

    it("keeps a clip while one of its plays still runs", () => {
        const plays = withPlay(withPlay(NONE, "p1", "a"), "p2", "a");

        expect(collectClipIds(withoutPlay(plays, "p1")).has("a")).toBe(true);
        expect(
            collectClipIds(withoutPlay(withoutPlay(plays, "p1"), "p2")).has("a")
        ).toBe(false);
    });

    it("is empty with no plays", () => {
        expect(collectClipIds(NONE).size).toBe(0);
    });
});

describe("stopsLocalPlay", () => {
    const plays = withPlay(NONE, "p1", "clip-a");

    it("stops a play of ours", () => {
        expect(stopsLocalPlay({ playId: "p1" }, plays)).toBe(true);
    });

    it("ignores a play that is not ours", () => {
        expect(stopsLocalPlay({ playId: "someone-else" }, plays)).toBe(false);
    });

    it("ignores a play that already ended here", () => {
        expect(stopsLocalPlay({ playId: "p1" }, withoutPlay(plays, "p1"))).toBe(
            false
        );
    });

    it("ignores everything when nothing plays", () => {
        expect(stopsLocalPlay({ playId: "p1" }, NONE)).toBe(false);
    });
});
