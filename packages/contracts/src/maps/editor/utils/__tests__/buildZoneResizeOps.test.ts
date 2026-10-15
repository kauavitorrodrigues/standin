import { describe, expect, it } from "vitest";
import { buildZoneResizeOps } from "../buildZoneResizeOps";
import type { EditorModel } from "../../types/editor-model";

const emptyModel = (): EditorModel =>
    ({
        mapId: "m",
        width: 10,
        height: 10,
        layout: { width: 10, height: 10, layers: [], tilesets: [] },
        placed: [],
        desks: [],
        library: { assets: [], tilesets: [] },
        limits: { objectsUsed: 0, objectsMax: 100 },
        version: 1,
    }) as unknown as EditorModel;

describe("buildZoneResizeOps", () => {
    it("adds nothing when the area has no floor and no objects", () => {
        const ops = buildZoneResizeOps(
            emptyModel(),
            { x: 1, y: 1, w: 3, h: 3 },
            { x: 1, y: 1, w: 5, h: 5 }
        );
        expect(ops).toEqual([]);
    });
});
