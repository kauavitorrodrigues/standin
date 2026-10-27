import { describe, expect, it } from "vitest";
import {
    areRemoteVideosEqual,
    dedupeEntries,
    slotOfSource,
} from "../remoteVideo";

const track = (id: string) => ({ id }) as unknown as MediaStreamTrack;

describe("remote video helpers", () => {
    it("tells a screen from a camera by its source", () => {
        expect(slotOfSource("screen")).toBe("screen");
        expect(slotOfSource("camera")).toBe("camera");
    });

    it("keeps the newest entry for a person and slot", () => {
        const entries = dedupeEntries([
            ["c1", { userId: "a", slot: "camera", track: track("old") }],
            ["c2", { userId: "a", slot: "camera", track: track("new") }],
            ["c3", { userId: "a", slot: "screen", track: track("screen") }],
        ]);
        expect(entries.map((entry) => entry.track.id)).toEqual([
            "new",
            "screen",
        ]);
    });

    it("compares by id and stream", () => {
        const stream = {} as MediaStream;
        expect(
            areRemoteVideosEqual([{ id: "a", stream }], [{ id: "a", stream }])
        ).toBe(true);
        expect(
            areRemoteVideosEqual([{ id: "a", stream }], [{ id: "b", stream }])
        ).toBe(false);
    });
});
