import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import {
    FLOOR_IMAGE_ID,
    WALL_IMAGE_ID,
    buildLayout,
    library,
} from "../../../layout/__tests__/fixtures";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import type { Stamp } from "../../types/stamp";
import { applyEditorOp } from "../applyEditorOp";
import { buildBlankEditorModel } from "../buildBlankEditorModel";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        type: "DECORATION",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        ...overrides,
    }) as AssetDefinition;

export const table = asset({
    id: "table",
    type: "TABLE",
    footprint: { w: 2, h: 1, offsetX: 0 },
});
export const chair = asset({ id: "chair", type: "CHAIR" });
export const monitor = asset({
    id: "monitor",
    type: "MONITOR",
    placement: "SURFACE",
});
export const poster = asset({
    id: "poster",
    type: "POSTER",
    placement: "WALL",
});

export const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [table, chair, monitor, poster],
    categories: [],
    areas: [],
} as unknown as LibraryPalette;

// A map with a floor and no walls, so a stamp is the only thing on it.
export const buildMapModel = (): EditorModel => {
    const layout = buildLayout();
    findTileLayer(layout, "walls")!.data.fill(0);
    findTileLayer(layout, "foreground")!.data.fill(0);
    return {
        mapId: "map-1",
        width: layout.width,
        height: layout.height,
        layout,
        placed: [],
        library: palette,
        desks: [],
        limits: { objectsUsed: 0, objectsMax: 100 },
        version: 1,
    };
};

export const buildBlankModel = (width: number, height: number): EditorModel =>
    buildBlankEditorModel({ width, height, library: palette });

// 4 x 4: floor everywhere, a wall on the top row, a decoration and a ceiling,
// a table with a monitor and a chair on the row below the wall, a poster on
// the wall and an area zone.
export const buildStamp = (): Stamp => ({
    version: 1,
    width: 4,
    height: 4,
    palette: [
        { tilesetId: FLOOR_IMAGE_ID, tileIndex: 1 },
        { tilesetId: WALL_IMAGE_ID, tileIndex: 0 },
        { tilesetId: WALL_IMAGE_ID, tileIndex: 2 },
        { tilesetId: WALL_IMAGE_ID, tileIndex: 3 },
    ],
    layers: {
        ground: new Array<number>(16).fill(1),
        walls: [2, 2, 2, 2, ...new Array<number>(12).fill(0)],
        furniture: [...new Array<number>(15).fill(0), 3],
        foreground: [...new Array<number>(12).fill(0), 4, 0, 0, 0],
    },
    objects: [
        {
            assetId: "table",
            dx: 1,
            dy: 2,
            offsetX: 3,
            offsetY: -4,
            parentIndex: null,
        },
        {
            assetId: "monitor",
            dx: 1,
            dy: 2,
            offsetX: 0,
            offsetY: 0,
            parentIndex: 0,
        },
        {
            assetId: "chair",
            dx: 0,
            dy: 3,
            offsetX: -2,
            offsetY: 5,
            parentIndex: null,
        },
        {
            assetId: "poster",
            dx: 2,
            dy: 0,
            offsetX: 0,
            offsetY: 0,
            parentIndex: null,
        },
    ],
    zone: { label: "Sala" },
});

export const tempIds = (): (() => string) => {
    let count = 0;
    return () => `tmp-${++count}`;
};

// Applies the operations in order and answers the model plus the operations
// that undo them all, last step first, as the draft store keeps them.
export const applyAll = (model: EditorModel, ops: EditorOp[]) => {
    let current = model;
    const inverseBySteps: EditorOp[][] = [];
    for (const op of ops) {
        const result = applyEditorOp(current, op);
        if (!result.ok) throw new Error(JSON.stringify(result.errors));
        current = result.model;
        inverseBySteps.push(result.inverse);
    }
    return { model: current, inverse: inverseBySteps.reverse().flat() };
};
