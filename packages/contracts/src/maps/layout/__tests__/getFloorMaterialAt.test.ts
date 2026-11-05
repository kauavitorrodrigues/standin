import { describe, expect, it } from "vitest";
import { getFloorMaterialAt } from "../getFloorMaterialAt";
import type { LayoutLibrary } from "../library";
import { buildLayout, FLOOR_IMAGE_ID, library } from "./fixtures";

// Tile 0 is the one the blank map paints on the ground.
const withMaterial = (material: "STONE" | undefined): LayoutLibrary => ({
    tilesets: {
        ...library.tilesets,
        [FLOOR_IMAGE_ID]: {
            ...library.tilesets[FLOOR_IMAGE_ID]!,
            tileMeta: {
                ...library.tilesets[FLOOR_IMAGE_ID]!.tileMeta,
                "0": { category: "FLOOR", blankDefault: true, material },
            },
        },
    },
});

describe("getFloorMaterialAt", () => {
    it("answers the material of the tile under the cell", () => {
        const layout = buildLayout();

        expect(getFloorMaterialAt(layout, withMaterial("STONE"), 2, 2)).toBe(
            "STONE"
        );
    });

    it("answers wood when the tile has no material", () => {
        const layout = buildLayout();

        expect(getFloorMaterialAt(layout, withMaterial(undefined), 2, 2)).toBe(
            "WOOD"
        );
        expect(getFloorMaterialAt(layout, library, 2, 2)).toBe("WOOD");
    });

    it("answers wood for an empty cell", () => {
        const layout = buildLayout();
        const ground = layout.layers.find((layer) => layer.name === "ground")!;
        if (ground.type !== "tilelayer") return;
        ground.data[2 * layout.width + 2] = 0;

        expect(getFloorMaterialAt(layout, withMaterial("STONE"), 2, 2)).toBe(
            "WOOD"
        );
    });

    it("answers wood outside the map", () => {
        const layout = buildLayout();
        const stone = withMaterial("STONE");

        expect(getFloorMaterialAt(layout, stone, -1, 0)).toBe("WOOD");
        expect(getFloorMaterialAt(layout, stone, 0, -1)).toBe("WOOD");
        expect(getFloorMaterialAt(layout, stone, layout.width, 0)).toBe("WOOD");
        expect(getFloorMaterialAt(layout, stone, 0, layout.height)).toBe(
            "WOOD"
        );
    });

    it("answers wood when the gid points at an unknown tileset", () => {
        const layout = buildLayout();

        expect(getFloorMaterialAt(layout, { tilesets: {} }, 2, 2)).toBe("WOOD");
    });
});
