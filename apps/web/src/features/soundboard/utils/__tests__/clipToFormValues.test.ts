import { describe, expect, it } from "vitest";
import { clipToFormValues } from "../clipToFormValues";

describe("clipToFormValues", () => {
    it("turns no icon into the empty string of the form", () => {
        expect(
            clipToFormValues({ name: "a", icon: null, volume: 0.5 })
        ).toEqual({ name: "a", icon: "", volume: 0.5 });
    });

    it("keeps the icon", () => {
        expect(
            clipToFormValues({ name: "a", icon: "🔔", volume: 1 }).icon
        ).toBe("🔔");
    });
});
