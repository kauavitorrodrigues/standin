import { describe, expect, it } from "vitest";
import { getAvatarDepth } from "../getAvatarDepth";
import { getDepthAt } from "../buildPlacedSlices";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";

const base = { mapHeightPx: 640, isSitting: false };

describe("getAvatarDepth", () => {
    it("draws under an object whose base is below the feet", () => {
        const treeBase = 320;
        const behind = getAvatarDepth({ ...base, feetY: 258 });
        expect(behind).toBeLessThan(getDepthAt(treeBase, base.mapHeightPx));
    });

    it("draws over an object whose base is above the feet", () => {
        const treeBase = 320;
        const inFront = getAvatarDepth({ ...base, feetY: 368 });
        expect(inFront).toBeGreaterThan(getDepthAt(treeBase, base.mapHeightPx));
    });

    it("draws a seated avatar over everything", () => {
        expect(
            getAvatarDepth({ ...base, feetY: 8, isSitting: true })
        ).toBeGreaterThan(getAvatarDepth({ ...base, feetY: 648 }));
    });

    it("draws an avatar seated facing up by its feet, behind the chair", () => {
        const chairBase = 320;
        const seated = getAvatarDepth({
            ...base,
            feetY: 300,
            isSitting: true,
            seatDirection: "up",
        });

        expect(seated).toBeLessThan(getDepthAt(chairBase, base.mapHeightPx));
    });

    it("draws an avatar seated on a piece just over it", () => {
        const pieceDepth = getDepthAt(320, base.mapHeightPx);
        const seated = getAvatarDepth({
            ...base,
            feetY: 300,
            isSitting: true,
            seatDirection: "down",
            seatDepth: pieceDepth,
        });

        expect(seated).toBeGreaterThan(pieceDepth);
        expect(seated).toBeLessThan(
            pieceDepth + PLACED_ASSET_DEPTH.SEAT_COVER_STEP
        );
    });

    it.each(["down", "left", "right"] as const)(
        "draws an avatar seated facing %s over everything when the piece is unknown",
        (seatDirection) => {
            expect(
                getAvatarDepth({
                    ...base,
                    feetY: 8,
                    isSitting: true,
                    seatDirection,
                })
            ).toBe(PLACED_ASSET_DEPTH.SEATED_AVATAR);
        }
    );
});
