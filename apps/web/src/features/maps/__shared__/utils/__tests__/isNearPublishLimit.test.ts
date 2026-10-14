import { describe, expect, it } from "vitest";
import { MAX_PUBLISH_OPS } from "@standin/contracts";
import { isNearPublishLimit } from "@/features/maps/__shared__/utils/isNearPublishLimit";

describe("isNearPublishLimit", () => {
    it("warns from 80 percent of the limit", () => {
        const edge = MAX_PUBLISH_OPS * 0.8;
        expect(isNearPublishLimit(edge - 1)).toBe(false);
        expect(isNearPublishLimit(edge)).toBe(true);
        expect(isNearPublishLimit(MAX_PUBLISH_OPS)).toBe(true);
    });
});
