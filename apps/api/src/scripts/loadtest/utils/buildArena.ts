import { cellKey, readWallCells, type MapLayout } from "@standin/contracts";
import { ARENA_SIZE_PX } from "../consts";

type Point = { x: number; y: number };

// Where the bots may stand. Positions are the feet of an avatar, in px.
export type Arena = {
    widthPx: number;
    heightPx: number;
    isFree: (x: number, y: number) => boolean;
    randomFreePoint: (rng: () => number) => Point;
};

// How many random points are tried before falling back to the first free cell.
const FREE_POINT_ATTEMPTS = 200;

type MapShape = {
    // Size of the map in tiles.
    width: number;
    height: number;
    tileSize: number;
    layout: MapLayout;
};

// The arena of a real map: inside its bounds and off its wall tiles. Placed
// objects (desks, plants) are not read, so a bot can still stand on one. That
// costs the server nothing, the walls are what keeps the bots on the floor.
export const buildMapArena = ({
    width,
    height,
    tileSize,
    layout,
}: MapShape): Arena => {
    const walls = readWallCells(layout);
    const widthPx = width * tileSize;
    const heightPx = height * tileSize;

    const isFree = (x: number, y: number): boolean => {
        if (x < 0 || y < 0 || x >= widthPx || y >= heightPx) return false;

        return !walls.has(
            cellKey(Math.floor(x / tileSize), Math.floor(y / tileSize))
        );
    };

    const randomFreePoint = (rng: () => number): Point => {
        for (let attempt = 0; attempt < FREE_POINT_ATTEMPTS; attempt += 1) {
            const point = {
                x: Math.round(rng() * (widthPx - 1)),
                y: Math.round(rng() * (heightPx - 1)),
            };
            if (isFree(point.x, point.y)) return point;
        }
        return findFirstFreePoint(width, height, tileSize, isFree);
    };

    return { widthPx, heightPx, isFree, randomFreePoint };
};

const findFirstFreePoint = (
    width: number,
    height: number,
    tileSize: number,
    isFree: (x: number, y: number) => boolean
): Point => {
    for (let row = 0; row < height; row += 1) {
        for (let column = 0; column < width; column += 1) {
            const point = {
                x: column * tileSize + tileSize / 2,
                y: row * tileSize + tileSize / 2,
            };
            if (isFree(point.x, point.y)) return point;
        }
    }
    throw new Error("The map has no free cell for a bot to stand on.");
};

// A plain square with no walls, for tests and for a harness that has no map.
export const buildSquareArena = (sizePx: number = ARENA_SIZE_PX): Arena => ({
    widthPx: sizePx,
    heightPx: sizePx,
    isFree: (x, y) => x >= 0 && y >= 0 && x <= sizePx && y <= sizePx,
    randomFreePoint: (rng) => ({
        x: Math.round(rng() * sizePx),
        y: Math.round(rng() * sizePx),
    }),
});
