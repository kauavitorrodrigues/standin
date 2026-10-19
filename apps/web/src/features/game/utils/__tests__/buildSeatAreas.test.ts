import { describe, expect, it } from "vitest";
import { ASSET_PLACEMENTS } from "@standin/contracts";
import { isWithinReach } from "@/features/game/utils/isWithinReach";
import { getDepthAt } from "@/features/game/utils/buildPlacedSlices";
import { buildSeatAreas } from "@/features/game/utils/buildSeatAreas";
import { findNearestSeat } from "@/features/game/utils/findNearestSeat";
import { resolveSeatInput } from "@/features/game/utils/resolveSeatInput";

const MAP_HEIGHT = 640;

const chair = {
    id: "chair",
    type: "CHAIR" as const,
    placement: ASSET_PLACEMENTS.GROUND,
    solid: true,
    surfaceHeightPx: 0,
    sprite: { w: 32, h: 48 },
    footprint: { w: 1, h: 1, offsetX: 0 },
    action: "SIT" as const,
    actionParams: { seats: [{ dx: 16, dy: 20, facing: "UP" }] },
};
const rug = { ...chair, id: "rug", action: null, actionParams: null };
const byId = (...assets: (typeof chair | typeof rug)[]) =>
    new Map<string, typeof chair | typeof rug>(
        assets.map((asset) => [asset.id, asset])
    );
const place = (assetId: string, id = "p1") => ({
    id,
    assetId,
    tileX: 3,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
});

describe("buildSeatAreas", () => {
    it("puts the seat where it was marked on the sprite", () => {
        const [area] = buildSeatAreas(
            [place("chair")],
            byId(chair),
            MAP_HEIGHT
        );
        // The sprite starts at x 96 and its base is at y 192.
        expect(area?.seats).toEqual([
            {
                x: 112,
                y: 172,
                direction: "up",
                depth: getDepthAt(192, MAP_HEIGHT),
            },
        ]);
    });

    it("keeps the footprint the avatar pushes against", () => {
        const [area] = buildSeatAreas(
            [place("chair")],
            byId(chair),
            MAP_HEIGHT
        );
        expect(area?.footprint).toEqual({
            x: 96,
            y: 160,
            width: 32,
            height: 32,
        });
    });

    it("skips pieces without the sit action or with unreadable seats", () => {
        const broken = { ...chair, id: "broken", actionParams: { seats: [] } };
        const areas = buildSeatAreas(
            [place("rug", "a"), place("broken", "b")],
            byId(rug, broken),
            MAP_HEIGHT
        );
        expect(areas).toEqual([]);
    });
});

describe("findNearestSeat", () => {
    const seats = [
        { x: 0, y: 0, direction: "down" as const, depth: 0 },
        { x: 100, y: 0, direction: "down" as const, depth: 0 },
    ];

    it("picks the seat closest to the avatar", () => {
        expect(findNearestSeat(seats, { x: 90, y: 5 })).toBe(seats[1]);
    });

    it("has none without seats", () => {
        expect(findNearestSeat([], { x: 0, y: 0 })).toBeNull();
    });
});

describe("resolveSeatInput", () => {
    it("does not stand up while the key that walked in is still held", () => {
        const sat = resolveSeatInput({
            isSitting: true,
            isMoving: true,
            released: false,
        });
        expect(sat.standUp).toBe(false);
    });

    it("stands up on a new press after the keys were let go", () => {
        const letGo = resolveSeatInput({
            isSitting: true,
            isMoving: false,
            released: false,
        });
        expect(letGo.released).toBe(true);
        const pressed = resolveSeatInput({
            isSitting: true,
            isMoving: true,
            released: letGo.released,
        });
        expect(pressed.standUp).toBe(true);
    });

    it("forgets the release once standing", () => {
        expect(
            resolveSeatInput({
                isSitting: false,
                isMoving: true,
                released: true,
            })
        ).toEqual({ standUp: false, released: false });
    });
});

describe("isWithinReach", () => {
    const footprint = { x: 96, y: 160, width: 32, height: 32 };

    it("reaches an avatar close to the footprint", () => {
        expect(isWithinReach(footprint, { x: 87, y: 176 }, 14)).toBe(true);
    });

    it("does not reach one farther than the reach", () => {
        expect(isWithinReach(footprint, { x: 70, y: 176 }, 14)).toBe(false);
    });

    it("with no reach, only an avatar inside the footprint counts", () => {
        expect(isWithinReach(footprint, { x: 110, y: 176 }, 0)).toBe(true);
        expect(isWithinReach(footprint, { x: 90, y: 176 }, 0)).toBe(false);
    });
});
