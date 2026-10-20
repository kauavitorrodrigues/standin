import { describe, expect, it } from "vitest";
import { AVATAR } from "@standin/contracts";
import { getAvatarHitRect } from "../getAvatarHitRect";

describe("getAvatarHitRect", () => {
    it("is centered on the anchor and grows upwards from it", () => {
        const rect = getAvatarHitRect({ x: 100, y: 200 });

        expect(rect.x + rect.width / 2).toBe(100);
        expect(rect.y + rect.height).toBe(200);
        expect(rect.width).toBe(AVATAR.hit.w);
        expect(rect.height).toBe(AVATAR.hit.h);
    });
});
