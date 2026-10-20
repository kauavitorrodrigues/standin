import { describe, expect, it } from "vitest";
import { AVATAR_SLOT_TABS, AVATAR_SLOTS } from "@standin/contracts";
import { buildPartChanges } from "../admin/buildPartChanges";
import { buildPartFormData } from "../admin/buildPartFormData";
import { buildSheetFormData } from "../admin/buildSheetFormData";
import { getSlotLabel } from "../admin/getSlotLabel";
import { getSlotOptions } from "../admin/getSlotOptions";

const file = (name: string) => new File(["x"], name, { type: "image/png" });

describe("buildPartChanges", () => {
    const initial = { name: "Cabelo", colorKey: "Preto", colorHex: "#32343B" };

    it("is empty when nothing changed", () => {
        expect(buildPartChanges(initial, { ...initial })).toEqual({});
    });

    it("sends only the fields that changed", () => {
        expect(
            buildPartChanges(initial, { ...initial, name: "Cabelo longo" })
        ).toEqual({ name: "Cabelo longo" });
    });

    it("sends the color as a pair", () => {
        expect(
            buildPartChanges(initial, {
                ...initial,
                colorKey: "Ruivo",
                colorHex: "#933A29",
            })
        ).toEqual({ colorKey: "Ruivo", colorHex: "#933A29" });
    });

    it("never sends an empty color, the API cannot take it away", () => {
        expect(
            buildPartChanges(initial, {
                ...initial,
                colorKey: "",
                colorHex: "",
            })
        ).toEqual({});
    });
});

describe("buildPartFormData", () => {
    const data = {
        name: "Mochila",
        slot: AVATAR_SLOTS.OTHER,
        colorKey: "Vermelho",
        colorHex: "#F03827",
    };

    it("sends the sprite, the preview and the data", () => {
        const body = buildPartFormData({
            image: file("front.png"),
            preview: file("preview.png"),
            data,
        });

        expect(body.has("image")).toBe(true);
        expect((body.get("preview") as File).name).toBe("preview.png");
        expect(JSON.parse(String(body.get("data")))).toEqual(data);
    });
});

describe("buildSheetFormData", () => {
    it("puts the sprite in the image part", () => {
        const body = buildSheetFormData(file("a.png"));
        expect(body.has("image")).toBe(true);
    });
});

describe("slot labels", () => {
    it("names every slot", () => {
        for (const slot of AVATAR_SLOT_TABS) {
            expect(getSlotLabel(slot).length).toBeGreaterThan(0);
        }
    });

    it("lists the options in the order of the editor tabs", () => {
        expect(getSlotOptions().map((option) => option.value)).toEqual([
            ...AVATAR_SLOT_TABS,
        ]);
    });
});
