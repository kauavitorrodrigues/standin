import { TILE_SIZE } from "@standin/contracts";
import {
    getAvatarBodyRect,
    type AvatarBody,
} from "@/features/game/utils/getAvatarBodyRect";
import type { PlacedRect } from "@/features/game/utils/placed";

type Point = { x: number; y: number };

const toKey = (column: number, row: number): string => `${column},${row}`;

/**
 * Answers "does an avatar with its feet here overlap a solid" without reading
 * every solid: each one is filed under the tiles it touches, and a body only
 * looks at the tiles it covers. `margin` fattens the body on every side, so a
 * way that only grazes a solid does not count as free.
 */
export const buildSolidIndex = (
    solidRects: readonly PlacedRect[],
    body: AvatarBody,
    margin = 0
): ((feet: Point) => boolean) => {
    const tiles = new Map<string, PlacedRect[]>();
    solidRects.forEach((solid) => {
        const first = Math.floor(solid.x / TILE_SIZE);
        const last = Math.floor((solid.x + solid.width) / TILE_SIZE);
        const top = Math.floor(solid.y / TILE_SIZE);
        const bottom = Math.floor((solid.y + solid.height) / TILE_SIZE);
        for (let column = first; column <= last; column++) {
            for (let row = top; row <= bottom; row++) {
                const key = toKey(column, row);
                const list = tiles.get(key);
                if (list) list.push(solid);
                else tiles.set(key, [solid]);
            }
        }
    });

    return (feet) => {
        const rect = getAvatarBodyRect(feet, {
            w: body.w + margin * 2,
            h: body.h + margin * 2,
        });
        // The fatter body also grows downwards by the margin.
        const y = rect.y + margin;
        const first = Math.floor(rect.x / TILE_SIZE);
        const last = Math.floor((rect.x + rect.width) / TILE_SIZE);
        const top = Math.floor(y / TILE_SIZE);
        const bottom = Math.floor((y + rect.height) / TILE_SIZE);

        for (let column = first; column <= last; column++) {
            for (let row = top; row <= bottom; row++) {
                const hit = tiles.get(toKey(column, row))?.some(
                    (solid) =>
                        rect.x < solid.x + solid.width &&
                        rect.x + rect.width > solid.x &&
                        y < solid.y + solid.height &&
                        y + rect.height > solid.y
                );
                if (hit) return true;
            }
        }
        return false;
    };
};
