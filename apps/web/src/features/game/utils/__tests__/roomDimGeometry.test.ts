import { describe, expect, it } from "vitest";
import { getRoomPolygonPoints } from "@/features/game/utils/roomDimGeometry";

const rect = { key: "r", label: "R", x: 32, y: 64, width: 96, height: 64 };

describe("getRoomPolygonPoints", () => {
    it("gives the four corners of a rectangle", () => {
        expect(getRoomPolygonPoints(rect)).toEqual([
            { x: 32, y: 64 },
            { x: 128, y: 64 },
            { x: 128, y: 128 },
            { x: 32, y: 128 },
        ]);
    });

    it("moves a polygon into world space", () => {
        const room = {
            ...rect,
            polygon: [
                { x: 0, y: 0 },
                { x: 32, y: 0 },
                { x: 0, y: 32 },
            ],
        };
        expect(getRoomPolygonPoints(room)).toEqual([
            { x: 32, y: 64 },
            { x: 64, y: 64 },
            { x: 32, y: 96 },
        ]);
    });

    it("keeps the vertex order of a polygon", () => {
        const room = {
            ...rect,
            polygon: [
                { x: 0, y: 0 },
                { x: 96, y: 0 },
                { x: 96, y: 32 },
                { x: 32, y: 32 },
                { x: 32, y: 64 },
                { x: 0, y: 64 },
            ],
        };
        const points = getRoomPolygonPoints(room);
        expect(points).toHaveLength(6);
        expect(points[3]).toEqual({ x: 64, y: 96 });
        expect(points[5]).toEqual({ x: 32, y: 128 });
    });

    it("falls back to the rectangle for an empty polygon", () => {
        expect(getRoomPolygonPoints({ ...rect, polygon: [] })).toHaveLength(4);
    });
});
