import { describe, expect, it } from "vitest";
import type { AvatarSlot } from "../../enums/slots";
import type { AvatarPartSheets } from "../../types/layer";
import { orderLayers } from "../orderLayers";

const part = (slot: AvatarSlot): AvatarPartSheets<string> => ({
    slot,
    front: `${slot}:front`,
});

const describeLayers = (
    parts: AvatarPartSheets<string>[],
    base: string | null = null
) => orderLayers(parts, base).map((layer) => `${layer.side}:${layer.slot}`);

describe("orderLayers", () => {
    it("returns nothing without parts", () => {
        expect(orderLayers([])).toEqual([]);
    });

    it("orders the front layers by the front order whatever the input order", () => {
        expect(
            describeLayers([
                part("HAT"),
                part("SKIN"),
                part("TOP"),
                part("HAIR"),
            ])
        ).toEqual(["front:SKIN", "front:TOP", "front:HAIR", "front:HAT"]);
    });

    it("draws the base before the front layers", () => {
        expect(
            describeLayers([part("SKIN"), part("HAIR"), part("HAT")], "base")
        ).toEqual([
            "base:null",
            "front:SKIN",
            "front:HAIR",
            "front:HAT",
        ]);
    });

    it("draws only the base without parts", () => {
        const layers = orderLayers<string>([], "sheet");
        expect(layers).toEqual([{ slot: null, side: "base", sheet: "sheet" }]);
    });

    it("does not draw the base under a costume", () => {
        expect(describeLayers([part("COSTUME")], "base")).toEqual([
            "front:COSTUME",
        ]);
    });

    it("lets the costume replace everything", () => {
        expect(
            describeLayers([part("SKIN"), part("HAIR"), part("COSTUME")])
        ).toEqual(["front:COSTUME"]);
    });

    it("does not change its input", () => {
        const input = [part("HAT"), part("SKIN")];
        orderLayers(input);
        expect(input.map((entry) => entry.slot)).toEqual(["HAT", "SKIN"]);
    });
});
