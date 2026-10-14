import { describe, expect, it } from "vitest";
import { ADMIN_SECTION_VALUES } from "../../consts/adminSections";
import { resolveAdminSection } from "../resolveAdminSection";

describe("resolveAdminSection", () => {
    it("resolves the areas section and everything under it", () => {
        expect(resolveAdminSection("/admin/areas")).toBe(
            ADMIN_SECTION_VALUES.AREAS
        );
        expect(resolveAdminSection("/admin/areas/new")).toBe(
            ADMIN_SECTION_VALUES.AREAS
        );
        expect(resolveAdminSection("/admin/areas/a1/edit")).toBe(
            ADMIN_SECTION_VALUES.AREAS
        );
    });

    it("keeps the other sections", () => {
        expect(resolveAdminSection("/admin/maps")).toBe(
            ADMIN_SECTION_VALUES.MAPS
        );
    });
});
