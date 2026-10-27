import { describe, expect, it } from "vitest";
import { selectNearbyPeers } from "../nearbyPeers";

describe("selectNearbyPeers", () => {
    const radii = { enterRadius: 120, exitRadius: 150 };
    const distances = new Map([
        ["near", 50],
        ["edge", 140],
        ["far", 400],
    ]);

    it("takes only who is inside the enter radius, nearest first", () => {
        expect(selectNearbyPeers(distances, new Set(), 4, radii)).toEqual(["near"]);
    });

    it("keeps who was shown until the exit radius", () => {
        expect(selectNearbyPeers(distances, new Set(["edge"]), 4, radii)).toEqual([
            "near",
            "edge",
        ]);
    });

    it("never goes past the limit", () => {
        expect(selectNearbyPeers(distances, new Set(["edge"]), 1, radii)).toEqual([
            "near",
        ]);
    });
});
