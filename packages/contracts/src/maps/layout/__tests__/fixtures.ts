import { generateBlankLayout } from "../generateBlankLayout";
import type { LayoutLibrary } from "../library";
import type { MapLayout } from "../../schemas/layout.schema";

export const FLOOR_IMAGE_ID = "tileset-floor";
export const WALL_IMAGE_ID = "tileset-wall";
export const PRIVATE_IMAGE_ID = "tileset-private";

// Floor tileset: tiles 0 and 1 are floor, 0 is the blank default, 2 is empty.
// Wall tileset: tile 0 is the wall (blank default, with top 1), tile 1 is the
// top, 2 is a decoration and 3 is a ceiling.
export const library: LayoutLibrary = {
    tilesets: {
        [FLOOR_IMAGE_ID]: {
            id: FLOOR_IMAGE_ID,
            organizationId: null,
            tileCount: 4,
            tileMeta: {
                "0": { category: "FLOOR", blankDefault: true },
                "1": { category: "FLOOR" },
                "2": { category: "EMPTY" },
            },
        },
        [WALL_IMAGE_ID]: {
            id: WALL_IMAGE_ID,
            organizationId: null,
            tileCount: 4,
            tileMeta: {
                "0": {
                    category: "WALL",
                    solid: true,
                    top: 1,
                    blankDefault: true,
                },
                "2": { category: "DECORATION" },
                "3": { category: "CEILING" },
            },
        },
        [PRIVATE_IMAGE_ID]: {
            id: PRIVATE_IMAGE_ID,
            organizationId: "org-1",
            tileCount: 2,
            tileMeta: { "0": { category: "FLOOR" } },
        },
    },
};

export const defaults = {
    floor: { tilesetId: FLOOR_IMAGE_ID, tileCount: 4, tileIndex: 0 },
    wall: { tilesetId: WALL_IMAGE_ID, tileCount: 4, tileIndex: 0, top: 1 },
};

export const buildLayout = (): MapLayout => generateBlankLayout("XS", defaults);
