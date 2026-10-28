import { describe, expect, it } from "vitest";
import { encodeObjectKey } from "../encodeObjectKey";

describe("encodeObjectKey", () => {
    it("keeps the slashes and encodes each segment", () => {
        expect(encodeObjectKey("maps/1/a b#.png")).toBe("maps/1/a%20b%23.png");
    });
});
