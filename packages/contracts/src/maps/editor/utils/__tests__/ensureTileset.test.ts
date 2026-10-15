import { describe, expect, it } from "vitest";
import { ensureTileset } from "../ensureTileset";
import {
    FLOOR_IMAGE_ID,
    PRIVATE_IMAGE_ID,
    WALL_IMAGE_ID,
    library,
} from "../../../layout/__tests__/fixtures";
import type { MapLayout } from "../../../schemas/layout.schema";

const layoutWith = (tilesets: MapLayout["tilesets"]): MapLayout =>
    ({ width: 2, height: 2, tilesets }) as MapLayout;

describe("ensureTileset", () => {
    it("appends the missing tileset at the end", () => {
        const layout = layoutWith([
            { name: WALL_IMAGE_ID, firstgid: 1 },
            { name: FLOOR_IMAGE_ID, firstgid: 5 },
        ]);
        const result = ensureTileset(layout, PRIVATE_IMAGE_ID, library);
        expect(result.tilesets).toEqual([
            { name: WALL_IMAGE_ID, firstgid: 1 },
            { name: FLOOR_IMAGE_ID, firstgid: 5 },
            { name: PRIVATE_IMAGE_ID, firstgid: 9 },
        ]);
    });

    it("does not mutate the input", () => {
        const layout = layoutWith([{ name: FLOOR_IMAGE_ID, firstgid: 1 }]);
        const snapshot = structuredClone(layout);
        ensureTileset(layout, WALL_IMAGE_ID, library);
        expect(layout).toEqual(snapshot);
    });

    it("is idempotent", () => {
        const layout = layoutWith([{ name: FLOOR_IMAGE_ID, firstgid: 1 }]);
        const once = ensureTileset(layout, WALL_IMAGE_ID, library);
        const twice = ensureTileset(once, WALL_IMAGE_ID, library);
        expect(twice).toEqual(once);
        expect(ensureTileset(layout, FLOOR_IMAGE_ID, library)).toEqual(layout);
    });
});
