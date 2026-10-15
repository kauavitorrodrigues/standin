import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { createFrameStore } from "@/features/editor/lib/FrameStore";
import { getFrameDoorRooms } from "@/features/editor/utils/getFrameDoorRooms";

const frame = (isRoom?: () => boolean) => ({
    store: createFrameStore({ x: 1, y: 2, w: 6, h: 4 }),
    limits: { minSize: 2, maxWidth: 40, maxHeight: 40 },
    isRoom,
});

describe("getFrameDoorRooms", () => {
    it("answers null without a frame or without the room switch", () => {
        expect(getFrameDoorRooms(null)).toBeNull();
        expect(getFrameDoorRooms(frame())).toBeNull();
    });

    it("answers no room when the area is not a room", () => {
        expect(getFrameDoorRooms(frame(() => false))).toEqual([]);
    });

    it("answers the frame as a private zone when the area is a room", () => {
        expect(getFrameDoorRooms(frame(() => true))).toEqual([
            expect.objectContaining({
                kind: "private",
                x: TILE_SIZE,
                y: 2 * TILE_SIZE,
                width: 6 * TILE_SIZE,
                height: 4 * TILE_SIZE,
            }),
        ]);
    });
});
