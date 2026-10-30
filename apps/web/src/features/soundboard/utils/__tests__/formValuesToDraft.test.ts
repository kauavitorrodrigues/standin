import { describe, expect, it } from "vitest";
import { formValuesToDraft } from "../formValuesToDraft";

describe("formValuesToDraft", () => {
    it("turns the empty icon of the form into none", () => {
        expect(
            formValuesToDraft({ name: "a", icon: "", volume: 1 }).icon
        ).toBeNull();
    });

    it("keeps an icon", () => {
        expect(
            formValuesToDraft({ name: "a", icon: "🎺", volume: 1 }).icon
        ).toBe("🎺");
    });

    it("trims the name and clamps the volume", () => {
        expect(
            formValuesToDraft({ name: "  Horn ", icon: "", volume: 4 })
        ).toEqual({ name: "Horn", icon: null, volume: 1 });
    });
});
