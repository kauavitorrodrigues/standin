import { describe, expect, it } from "vitest";
import type { LibraryTilesetSummary } from "@standin/contracts";
import { buildTilesetFacets, filterTilesets } from "../filterTilesets";

const tileset = (
    name: string,
    taggedCount: number,
    inUse: boolean
): LibraryTilesetSummary => ({
    id: name,
    key: name,
    name,
    url: "",
    widthPx: 64,
    heightPx: 64,
    tileCount: 4,
    columns: 2,
    taggedCount,
    progressPercent: taggedCount * 25,
    inUse,
});

const all = [
    tileset("Chão", 4, true),
    tileset("Parede", 1, false),
    tileset("Teto", 0, false),
];

describe("filterTilesets", () => {
    it("searches by name, ignoring case", () => {
        expect(filterTilesets(all, { search: "pAR" }).map((t) => t.id)).toEqual(
            ["Parede"]
        );
    });

    it("filters by usage", () => {
        expect(filterTilesets(all, { inUse: true })).toHaveLength(1);
        expect(filterTilesets(all, { inUse: false })).toHaveLength(2);
    });

    it("filters by progress", () => {
        expect(filterTilesets(all, { progress: "complete" })).toHaveLength(1);
        expect(filterTilesets(all, { progress: "incomplete" })).toHaveLength(2);
    });

    it("combines the filters", () => {
        expect(
            filterTilesets(all, { inUse: false, progress: "incomplete" })
        ).toHaveLength(2);
    });
});

describe("buildTilesetFacets", () => {
    it("counts every option over all the tilesets", () => {
        const facets = buildTilesetFacets(all);
        expect(facets.usage.map((o) => o.count)).toEqual([1, 2]);
        expect(facets.progress.map((o) => o.count)).toEqual([1, 2]);
    });
});
