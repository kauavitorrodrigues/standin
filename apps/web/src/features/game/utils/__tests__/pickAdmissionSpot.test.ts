import { describe, expect, it } from "vitest";
import { AVATAR } from "@standin/contracts";
import { pickAdmissionSpot } from "@/features/game/utils/pickAdmissionSpot";
import type { SeatArea } from "@/features/game/utils/buildSeatAreas";

const room = { key: "r", label: "R", x: 64, y: 64, width: 64, height: 64 };
const footprint = { x: 64, y: 64, width: 32, height: 32 };
const seat = (x: number, y: number) => ({
    x,
    y,
    direction: "down" as const,
    depth: 0,
});
const areas: SeatArea[] = [
    { footprint, seats: [seat(80, 80), seat(112, 112), seat(400, 400)] },
];
const base = {
    room,
    point: { x: 0, y: 0 },
    seatAreas: areas,
    isTaken: () => false,
    solidRects: [],
    body: AVATAR.body,
    wallCells: new Set<string>(),
    doors: [],
};

describe("pickAdmissionSpot", () => {
    it("picks the nearest free seat inside the room, ignoring outside ones", () => {
        const spot = pickAdmissionSpot({ ...base, point: { x: 400, y: 400 } });
        expect(spot).toEqual({ kind: "seat", seat: seat(112, 112) });
    });

    it("skips the taken seats", () => {
        const spot = pickAdmissionSpot({
            ...base,
            isTaken: (s) => s.x === 80,
        });
        expect(spot).toEqual({ kind: "seat", seat: seat(112, 112) });
    });

    it("falls back to the free cell nearest to the room center", () => {
        const spot = pickAdmissionSpot({
            ...base,
            room: { ...room, x: 0, y: 0, width: 160, height: 160 },
            seatAreas: [],
            point: { x: 0, y: 0 },
        });
        expect(spot).toEqual({ kind: "cell", x: 80, y: 80 });
    });

    it("skips wall cells, whether solid or not", () => {
        const wide = { ...room, x: 0, y: 0, width: 160, height: 160 };
        const spot = pickAdmissionSpot({
            ...base,
            room: wide,
            seatAreas: [],
            wallCells: new Set(["2,2", "3,2", "2,3", "3,3"]),
        });
        expect(spot?.kind).toBe("cell");
        const cell = spot as { x: number; y: number };
        expect([cell.x, cell.y]).not.toEqual([80, 80]);
        expect(
            Math.floor(cell.x / 32) < 2 ||
                Math.floor(cell.x / 32) > 3 ||
                Math.floor(cell.y / 32) < 2 ||
                Math.floor(cell.y / 32) > 3
        ).toBe(true);
    });

    it("keeps a tile away from the doors", () => {
        const wide = { ...room, x: 0, y: 0, width: 160, height: 160 };
        const door = {
            id: "d",
            roomKey: "r",
            x: 64,
            y: 128,
            width: 32,
            height: 32,
        };
        const spot = pickAdmissionSpot({
            ...base,
            room: wide,
            seatAreas: [],
            doors: [door],
        }) as { x: number; y: number };
        expect(spot.y).toBeLessThan(door.y - 16);
    });

    it("uses a cell beside a door when no other is left", () => {
        const door = {
            id: "d",
            roomKey: "r",
            x: 64,
            y: 64,
            width: 32,
            height: 32,
        };
        const spot = pickAdmissionSpot({
            ...base,
            seatAreas: [],
            doors: [door],
        });
        expect(spot?.kind).toBe("cell");
    });

    it("uses a wall cell only when the room has no floor cell", () => {
        const spot = pickAdmissionSpot({
            ...base,
            seatAreas: [],
            wallCells: new Set(["2,2", "3,2", "2,3", "3,3"]),
        });
        expect(spot?.kind).toBe("cell");
    });

    it("skips the blocked cells", () => {
        const spot = pickAdmissionSpot({
            ...base,
            seatAreas: [],
            solidRects: [{ x: 64, y: 64, width: 32, height: 32 }],
        });
        expect(spot).not.toEqual({ kind: "cell", x: 80, y: 80 });
        expect(spot?.kind).toBe("cell");
    });

    it("is null when the room has no seat nor free cell", () => {
        const spot = pickAdmissionSpot({
            ...base,
            seatAreas: [],
            solidRects: [{ x: 0, y: 0, width: 500, height: 500 }],
        });
        expect(spot).toBeNull();
    });
});
