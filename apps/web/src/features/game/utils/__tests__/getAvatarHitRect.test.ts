import { describe, expect, it } from "vitest";
import { AVATAR } from "@standin/contracts";
import { getAvatarHitRect, writeAvatarHitRect } from "../getAvatarHitRect";

describe("getAvatarHitRect", () => {
    it("is centered on the anchor and grows upwards from it", () => {
        const rect = getAvatarHitRect({ x: 100, y: 200 });

        expect(rect.x + rect.width / 2).toBe(100);
        expect(rect.y + rect.height).toBe(200);
        expect(rect.width).toBe(AVATAR.hit.w);
        expect(rect.height).toBe(AVATAR.hit.h);
    });

    it("writes the same rect into the object it is given", () => {
        const out = { x: 0, y: 0, width: 0, height: 0 };

        const result = writeAvatarHitRect({ x: 100, y: 200 }, out);

        expect(result).toBe(out);
        expect(out).toEqual(getAvatarHitRect({ x: 100, y: 200 }));
    });
});
