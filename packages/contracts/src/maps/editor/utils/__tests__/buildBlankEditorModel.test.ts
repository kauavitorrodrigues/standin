import { describe, expect, it } from "vitest";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { STAMP_MAX_OBJECTS } from "../../consts/limits";
import { buildBlankEditorModel } from "../buildBlankEditorModel";
import { palette } from "./stampTestKit";

describe("buildBlankEditorModel", () => {
    const model = buildBlankEditorModel({
        width: 2,
        height: 3,
        library: palette,
    });

    it("has the four tile layers zeroed at the area size", () => {
        for (const name of ["ground", "walls", "furniture", "foreground"]) {
            const layer = findTileLayer(model.layout, name);
            expect(layer?.data).toEqual(new Array(6).fill(0));
            expect(layer?.width).toBe(2);
            expect(layer?.height).toBe(3);
        }
        expect(model.layout.tilesets).toEqual([]);
    });

    it("has no zones, desks, objects or spawn", () => {
        expect(findZonesGroup(model.layout)?.objects).toEqual([]);
        expect(model.desks).toEqual([]);
        expect(model.placed).toEqual([]);
    });

    it("counts objects against the stamp limit and starts unversioned", () => {
        expect(model.limits).toEqual({
            objectsUsed: 0,
            objectsMax: STAMP_MAX_OBJECTS,
        });
        expect(model.version).toBe(0);
        expect(model.mapId).toBe("");
        expect(model.width).toBe(2);
        expect(model.height).toBe(3);
        expect(model.library).toBe(palette);
    });
});
