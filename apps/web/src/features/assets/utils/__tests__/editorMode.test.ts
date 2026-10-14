import { describe, expect, it } from "vitest";
import { getCollisionBlocker } from "../getCollisionBlocker";
import { getEditorMode } from "../getEditorMode";

describe("getEditorMode", () => {
    const base = { hasCrop: true, footprintOnly: false, canCollide: true };

    it("keeps the collision when it is available", () => {
        expect(getEditorMode({ ...base, chosenMode: "collision" })).toBe(
            "collision"
        );
    });

    it("falls back to the footprint when it stops being available", () => {
        expect(
            getEditorMode({
                ...base,
                chosenMode: "collision",
                canCollide: false,
            })
        ).toBe("footprint");
    });

    it("falls back to the crop when there is none yet", () => {
        expect(
            getEditorMode({
                ...base,
                chosenMode: "collision",
                canCollide: false,
                hasCrop: false,
            })
        ).toBe("crop");
    });

    it("keeps marking only the footprint in the variant editor", () => {
        expect(
            getEditorMode({ ...base, chosenMode: "crop", footprintOnly: true })
        ).toBe("footprint");
    });
});

describe("getCollisionBlocker", () => {
    const base = {
        hasCrop: true,
        hasFootprint: true,
        isAnimated: false,
        solid: true,
        canEdit: true,
    };

    it("is null when the painter can be used", () => {
        expect(getCollisionBlocker(base)).toBeNull();
    });

    it("says what to do when the asset does not block", () => {
        expect(getCollisionBlocker({ ...base, solid: false })).toContain(
            "Bloqueia a passagem"
        );
    });

    it("explains the other reasons", () => {
        expect(getCollisionBlocker({ ...base, hasCrop: false })).toContain(
            "recorte"
        );
        expect(getCollisionBlocker({ ...base, isAnimated: true })).toContain(
            "animada"
        );
        expect(getCollisionBlocker({ ...base, canEdit: false })).not.toBeNull();
    });
});
