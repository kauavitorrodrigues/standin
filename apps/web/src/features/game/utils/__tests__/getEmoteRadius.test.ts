import { describe, expect, it } from "vitest";
import { SPACE_EVENT_RADIUS_PX } from "@standin/contracts";
import { getEmoteRadius } from "../getEmoteRadius";

describe("getEmoteRadius", () => {
    it("is twice the reach of the voice in a short space", () => {
        expect(getEmoteRadius("Short")).toBe(320);
    });

    it("never goes past what the server sends in a long space", () => {
        expect(getEmoteRadius("Long")).toBe(SPACE_EVENT_RADIUS_PX);
    });
});
