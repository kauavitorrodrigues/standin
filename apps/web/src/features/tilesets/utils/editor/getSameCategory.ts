import type { TileMeta } from "@standin/contracts";

// Every tile of the sheet that shares the category of the tile (or the lack of
// one), touching it or not.
export const getTilesOfSameCategory = (
    meta: TileMeta,
    index: number,
    tileCount: number
): number[] => {
    const category = meta[String(index)]?.category;
    const tiles: number[] = [];
    for (let tile = 0; tile < tileCount; tile++) {
        if (meta[String(tile)]?.category === category) tiles.push(tile);
    }
    return tiles;
};
