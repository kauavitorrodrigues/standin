import { describe, expect, it, vi } from "vitest";
import { validateLayout } from "../validateLayout";
import { buildLayout, library } from "./fixtures";

// Every tier fits today, so the capacity is lowered to make the XL tier
// (51 people or more) too big for one space.
vi.mock("../../consts/constants", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../consts/constants")>()),
    MAX_SPACE_CAPACITY: 50,
}));

const codes = (level: "creation" | "complete", sizeTier: "XS" | "XL") =>
    validateLayout(buildLayout(), library, { level, sizeTier }).errors.map(
        (error) => error.code
    );

describe("validateLayout tier availability", () => {
    it("refuses a tier whose smallest group does not fit in a space", () => {
        expect(codes("creation", "XL")).toContain("TIER_DISABLED");
    });

    it("accepts a tier that fits", () => {
        expect(codes("creation", "XS")).not.toContain("TIER_DISABLED");
    });

    it("only checks the tier when a space is created", () => {
        expect(codes("complete", "XL")).not.toContain("TIER_DISABLED");
    });
});
