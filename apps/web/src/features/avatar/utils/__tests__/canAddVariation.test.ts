import { describe, expect, it } from "vitest";
import type { AvatarPartRow } from "@standin/contracts";
import { AVATAR_SLOTS } from "@standin/contracts";
import { canAddVariation } from "../admin/canAddVariation";

const row: AvatarPartRow = {
    id: "1",
    key: "tenis",
    name: "Tênis",
    slot: AVATAR_SLOTS.SHOES,
    basePartId: null,
    colorKey: "Vermelho",
    colorHex: "#F03827",
    url: "/files/1",
    previewUrl: "/files/1-preview",
    createdAt: "2026-10-14T10:00:00.000Z",
};

describe("canAddVariation", () => {
    it("is true for a base part with a color", () => {
        expect(canAddVariation(row)).toBe(true);
    });

    it("is false for a variation", () => {
        expect(canAddVariation({ ...row, basePartId: "0" })).toBe(false);
    });

    it("is false for a base part without a color", () => {
        expect(
            canAddVariation({ ...row, colorKey: null, colorHex: null })
        ).toBe(false);
    });
});
