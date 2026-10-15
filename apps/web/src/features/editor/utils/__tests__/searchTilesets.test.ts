import { describe, expect, it } from "vitest";
import { searchTilesets } from "@/features/editor/utils/searchTilesets";

const tilesets = [
    { id: "1", name: "Grama" },
    { id: "2", name: "Paredes de pedra" },
    { id: "3", name: "Pisos" },
];

describe("searchTilesets", () => {
    it("ignores accent and case", () => {
        expect(searchTilesets(tilesets, "PEDRA").map(({ id }) => id)).toEqual([
            "2",
        ]);
        expect(searchTilesets(tilesets, "gráma").map(({ id }) => id)).toEqual([
            "1",
        ]);
    });

    it("sorts the matches by name", () => {
        expect(searchTilesets(tilesets, "p").map(({ id }) => id)).toEqual([
            "2",
            "3",
        ]);
    });

    it("returns every tileset for an empty search", () => {
        expect(searchTilesets(tilesets, "  ").map(({ id }) => id)).toEqual([
            "1",
            "2",
            "3",
        ]);
    });
});
