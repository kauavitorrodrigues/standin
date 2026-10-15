import { describe, expect, it } from "vitest";
import { getAssetEditState, isEditFieldLocked } from "../getEditState";
import { getDeleteMode } from "../getDeleteMode";

describe("isEditFieldLocked", () => {
    it("locks everything but name, promptText and category while in use", () => {
        const state = getAssetEditState({ inUse: true });
        expect(isEditFieldLocked(state, "name")).toBe(false);
        expect(isEditFieldLocked(state, "promptText")).toBe(false);
        expect(isEditFieldLocked(state, "category")).toBe(false);
        expect(isEditFieldLocked(state, "solid")).toBe(true);
        expect(isEditFieldLocked(state, "placement")).toBe(true);
    });

    it("locks nothing while free", () => {
        const state = getAssetEditState({ inUse: false });
        expect(isEditFieldLocked(state, "solid")).toBe(false);
    });
});

describe("getDeleteMode", () => {
    const family = { variants: [{ id: "base" }, { id: "blue" }] };

    it("asks for the whole family to delete a base with variations", () => {
        expect(getDeleteMode({ id: "base", baseAssetId: null }, family)).toBe(
            "FAMILY"
        );
    });

    it("deletes a variation alone", () => {
        expect(getDeleteMode({ id: "blue", baseAssetId: "base" }, family)).toBe(
            "ALONE"
        );
    });

    it("deletes a base without variations alone", () => {
        expect(
            getDeleteMode(
                { id: "base", baseAssetId: null },
                { variants: [{ id: "base" }] }
            )
        ).toBe("ALONE");
    });
});
