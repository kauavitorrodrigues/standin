import { describe, expect, it } from "vitest";
import {
    addPinnedVideo,
    pinnedRemoteUserIds,
    removePinnedVideo,
} from "@/features/spaces/utils/pinnedVideos";

describe("addPinnedVideo", () => {
    it("pins an active video", () => {
        expect(addPinnedVideo([], "a", true, 1)).toEqual([
            { tileId: "a", pinnedAt: 1 },
        ]);
    });

    it("ignores an inactive video", () => {
        expect(addPinnedVideo([], "a", false, 1)).toEqual([]);
    });

    it("ignores a video that is already pinned", () => {
        const pinned = [{ tileId: "a", pinnedAt: 1 }];

        expect(addPinnedVideo(pinned, "a", true, 5)).toBe(pinned);
    });

    it("evicts the oldest pin on the third one", () => {
        const first = addPinnedVideo([], "a", true, 1);
        const second = addPinnedVideo(first, "b", true, 2);
        const third = addPinnedVideo(second, "c", true, 3);

        expect(third.map((entry) => entry.tileId)).toEqual(["b", "c"]);
    });

    it("evicts by pinnedAt, not by position", () => {
        const pinned = [
            { tileId: "newer", pinnedAt: 9 },
            { tileId: "older", pinnedAt: 2 },
        ];

        const next = addPinnedVideo(pinned, "c", true, 10);

        expect(next.map((entry) => entry.tileId)).toEqual(["newer", "c"]);
    });
});

describe("removePinnedVideo", () => {
    it("unpins one video", () => {
        const pinned = [
            { tileId: "a", pinnedAt: 1 },
            { tileId: "b", pinnedAt: 2 },
        ];

        expect(removePinnedVideo(pinned, "a")).toEqual([
            { tileId: "b", pinnedAt: 2 },
        ]);
    });
});

describe("pinnedRemoteUserIds", () => {
    const tile = (id: string, userId: string | null, isSelf = false) =>
        ({
            id,
            slot: "camera",
            stream: null,
            userId,
            label: id,
            isSelf,
            isMuted: false,
        }) as const;

    it("maps pinned tiles to remote users in pin order without repeats", () => {
        const tiles = [
            tile("a:camera", "a"),
            tile("a:screen", "a"),
            tile("b:avatar", "b"),
            tile("me", "me", true),
        ];
        expect(
            pinnedRemoteUserIds(tiles, ["b:avatar", "a:camera", "a:screen"])
        ).toEqual(["b", "a"]);
        expect(pinnedRemoteUserIds(tiles, ["me", "gone"])).toEqual([]);
    });
});
