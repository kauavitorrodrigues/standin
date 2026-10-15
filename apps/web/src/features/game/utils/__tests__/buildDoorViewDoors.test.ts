import { describe, expect, it } from "vitest";
import type { PlacedAsset } from "@standin/contracts";
import { buildDoorViewDoors } from "@/features/game/utils/buildDoorViewDoors";

const door = { id: "p1", roomKey: "r", x: 0, y: 0, width: 32, height: 32 };
const placed = [{ id: "p1", assetId: "a1" }] as PlacedAsset[];

describe("buildDoorViewDoors", () => {
    it("carries the asset and the frame count of the animation", () => {
        const assets = new Map([
            [
                "a1",
                {
                    animation: {
                        frameCount: 4,
                        frameDurationMs: 100,
                        repeat: 0,
                    },
                },
            ],
        ]);
        expect(buildDoorViewDoors([door], placed, assets)).toEqual([
            { id: "p1", roomKey: "r", assetId: "a1", frameCount: 4 },
        ]);
    });

    it("counts no frames for an asset without animation", () => {
        const assets = new Map([["a1", { animation: null }]]);
        expect(buildDoorViewDoors([door], placed, assets)[0]?.frameCount).toBe(
            0
        );
    });

    it("drops a door whose placed object is gone", () => {
        expect(buildDoorViewDoors([door], [], new Map())).toEqual([]);
    });
});
