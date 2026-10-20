import { describe, expect, it } from "vitest";
import { AVATAR } from "@standin/contracts";
import { buildSeatCover } from "@/features/game/utils/buildSeatCover";

const sofa = {
    action: "SIT" as const,
    actionParams: {
        seats: [
            { dx: 16, dy: 14, facing: "DOWN" },
            { dx: 48, dy: 18, facing: "DOWN" },
        ],
    },
    sprite: { w: 64, h: 48 },
};

describe("buildSeatCover", () => {
    it("covers from above the highest seat down to the base", () => {
        const cover = buildSeatCover(sofa);

        expect(cover).toEqual({
            y: 48 - 18 - AVATAR.seatedCover,
            height: 18 + AVATAR.seatedCover,
        });
    });

    it("has no cover for a piece without a sit action", () => {
        expect(
            buildSeatCover({ ...sofa, action: null, actionParams: null })
        ).toBeNull();
    });

    it("has no cover when the seats do not read", () => {
        expect(buildSeatCover({ ...sofa, actionParams: { seats: [] } })).toBe(
            null
        );
    });

    it("has no cover when every seat faces up", () => {
        const chair = {
            ...sofa,
            actionParams: { seats: [{ dx: 16, dy: 14, facing: "UP" }] },
        };

        expect(buildSeatCover(chair)).toBeNull();
    });

    it("keeps the cover inside the sprite for a tall seat", () => {
        const tall = {
            ...sofa,
            actionParams: { seats: [{ dx: 16, dy: 60, facing: "LEFT" }] },
        };

        expect(buildSeatCover(tall)).toEqual({ y: 0, height: 48 });
    });
});
