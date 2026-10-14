import { describe, expect, it } from "vitest";
import { isSectionActive } from "../isSectionActive";

describe("isSectionActive", () => {
    it("is active on the section page and everything under it", () => {
        expect(isSectionActive("/admin/areas", "/admin/areas")).toBe(true);
        expect(isSectionActive("/admin/areas/new", "/admin/areas")).toBe(true);
        expect(isSectionActive("/admin/areas/a1/edit", "/admin/areas")).toBe(
            true
        );
    });

    it("is not active on another section or on a lookalike path", () => {
        expect(isSectionActive("/admin/maps", "/admin/areas")).toBe(false);
        expect(isSectionActive("/admin/areas-old", "/admin/areas")).toBe(false);
    });
});
