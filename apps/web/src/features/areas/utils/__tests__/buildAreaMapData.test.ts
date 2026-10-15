import { describe, expect, it } from "vitest";
import type { EditorModel } from "@standin/contracts";
import { buildAreaMapData } from "../buildAreaMapData";

const floor = {
    id: "floor",
    name: "Floor",
    url: "/floor.png",
    widthPx: 64,
    heightPx: 32,
    columns: 2,
    tileCount: 2,
    margin: 0,
    spacing: 0,
    tileMeta: null,
};

const modelWith = (tilesets: { name: string; firstgid: number }[]) =>
    ({
        width: 16,
        height: 12,
        layout: { tilewidth: 32, tileheight: 32, tilesets, layers: [] },
        library: { tilesets: [floor], assets: [], categories: [], areas: [] },
        placed: [],
    }) as unknown as EditorModel;

describe("buildAreaMapData", () => {
    it("completes each declared tileset with its image and grid, as Phaser reads them", () => {
        const data = buildAreaMapData(
            modelWith([{ name: "floor", firstgid: 1 }])
        );

        expect(data.layout.tilesets).toEqual([
            expect.objectContaining({
                firstgid: 1,
                name: "floor",
                image: "floor",
                imagewidth: 64,
                imageheight: 32,
                columns: 2,
                tilecount: 2,
                tiles: [],
            }),
        ]);
        expect(data.tilesets).toEqual([
            { tilesetName: "floor", url: "/floor.png" },
        ]);
    });

    it("leaves out a tileset the library no longer has", () => {
        const data = buildAreaMapData(
            modelWith([
                { name: "floor", firstgid: 1 },
                { name: "gone", firstgid: 3 },
            ])
        );

        expect(data.layout.tilesets).toHaveLength(1);
    });
});
