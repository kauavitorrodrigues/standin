import { describe, expect, it } from "vitest";
import { resolveHeaderTab } from "../resolveHeaderTab";

describe("resolveHeaderTab", () => {
    it("is the spaces tab on the home page", () => {
        expect(resolveHeaderTab("/home")).toBe("spaces");
    });

    it("is the maps tab on the list and below it", () => {
        expect(resolveHeaderTab("/maps")).toBe("maps");
        expect(resolveHeaderTab("/maps/new")).toBe("maps");
    });

    it("falls back to spaces elsewhere", () => {
        expect(resolveHeaderTab("/mapsfoo")).toBe("spaces");
    });
});
