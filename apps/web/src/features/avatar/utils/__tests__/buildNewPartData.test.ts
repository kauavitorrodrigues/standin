import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import type { CreatePartPageValues } from "../../types/partCreate";
import { buildNewColorData, buildNewPartData } from "../admin/buildNewPartData";

const values: CreatePartPageValues = {
    slot: AVATAR_SLOTS.SHOES,
    name: "  Tênis  ",
    colorKey: "",
    colorHex: "",
    image: [],
    preview: [],
};

describe("buildNewPartData", () => {
    it("trims the name and leaves the color out when empty", () => {
        expect(buildNewPartData(values)).toEqual({
            name: "Tênis",
            slot: AVATAR_SLOTS.SHOES,
        });
    });

    it("sends the color as a pair, with the hex in upper case", () => {
        const data = buildNewPartData({
            ...values,
            colorKey: " Vermelho ",
            colorHex: "#f03827",
        });

        expect(data.colorKey).toBe("Vermelho");
        expect(data.colorHex).toBe("#F03827");
    });
});

describe("buildNewColorData", () => {
    it("trims the color name and upper cases the hex", () => {
        expect(
            buildNewColorData({
                colorKey: " Azul ",
                colorHex: "#2dbdff",
                image: [],
                preview: [],
            })
        ).toEqual({ colorKey: "Azul", colorHex: "#2DBDFF" });
    });
});
