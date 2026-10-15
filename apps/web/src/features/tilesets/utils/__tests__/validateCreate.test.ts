import { describe, expect, it } from "vitest";
import { buildTilesetData } from "../buildData";
import { getTilesetGrid } from "../grid/getGrid";
import { validateCreateTileset } from "../validateCreate";
import { png } from "@/features/assets/utils/__tests__/fixtures";
import type { CreateTilesetFormValues } from "../../types/createForm";

const values = (
    overrides: Partial<CreateTilesetFormValues> = {}
): CreateTilesetFormValues => ({
    image: [png("floors.png")],
    name: "Pisos",
    margin: 0,
    spacing: 0,
    tileMeta: {},
    ...overrides,
});

const grid = getTilesetGrid({ w: 128, h: 64 }, 0, 0);

describe("validateCreateTileset", () => {
    it("accepts a complete tileset", () => {
        expect(validateCreateTileset(values(), grid)).toEqual({});
    });

    it("asks for the PNG and the name", () => {
        const errors = validateCreateTileset(
            values({ image: [], name: " " }),
            null
        );
        expect(Object.keys(errors).sort()).toEqual(["image", "name"]);
    });

    it("points at the margin when the sheet does not divide into cells", () => {
        expect(validateCreateTileset(values(), null).margin).toMatch(
            /não divide/
        );
    });
});

describe("buildTilesetData", () => {
    it("sends the name and the grid, and no marks when there are none", () => {
        expect(buildTilesetData(values({ name: " Pisos " }), 8)).toEqual({
            name: "Pisos",
            margin: 0,
            spacing: 0,
        });
    });

    it("sends the marks that fit the sheet", () => {
        const data = buildTilesetData(
            values({
                tileMeta: {
                    "1": { category: "FLOOR", blankDefault: true },
                    "20": { category: "FLOOR" },
                },
            }),
            8
        );
        expect(data.tileMeta).toEqual({
            "1": { category: "FLOOR", blankDefault: true },
        });
    });
});
