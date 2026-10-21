import { describe, expect, it } from "vitest";
import { AVATAR } from "@standin/contracts";
import { getNameTagPosition } from "../getNameTagPosition";

describe("getNameTagPosition", () => {
    it("is over the feet, by the visible height and the gap", () => {
        expect(getNameTagPosition({ x: 100, y: 200 })).toEqual({
            x: 100,
            y: 200 - AVATAR.visible.h - AVATAR.nameTagGap,
        });
    });
});
