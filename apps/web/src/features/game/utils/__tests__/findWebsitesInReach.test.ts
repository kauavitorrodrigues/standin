import { describe, expect, it } from "vitest";
import { findWebsitesInReach } from "../findWebsitesInReach";

const area = (id: string, x: number, y: number) => ({
    id,
    bounds: { x, y, width: 32, height: 32 },
});

describe("findWebsitesInReach", () => {
    const areas = [area("b", 100, 100), area("a", 200, 100)];

    it("finds the object the point stands next to", () => {
        expect(findWebsitesInReach(areas, { x: 116, y: 148 }, 16)).toEqual([
            "b",
        ]);
    });

    it("counts the border of the reach", () => {
        expect(findWebsitesInReach(areas, { x: 84, y: 116 }, 16)).toEqual([
            "b",
        ]);
        expect(findWebsitesInReach(areas, { x: 83, y: 116 }, 16)).toEqual([]);
    });

    it("finds nothing far from every object", () => {
        expect(findWebsitesInReach(areas, { x: 600, y: 600 }, 16)).toEqual([]);
    });

    it("lists the ids sorted when several are within reach", () => {
        expect(findWebsitesInReach(areas, { x: 150, y: 116 }, 80)).toEqual([
            "a",
            "b",
        ]);
    });
});
