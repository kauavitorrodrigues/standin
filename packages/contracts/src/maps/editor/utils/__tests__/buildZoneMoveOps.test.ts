import { describe, expect, it } from "vitest";
import { isZoneObject, objectToZone } from "../../../layout/zone";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import type { EditorModel } from "../../types/editor-model";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { buildZoneMoveOps } from "../buildZoneMoveOps";
import { applyAll, buildModelWithStamp } from "./stampTestKit";

const zoneIdOf = (model: EditorModel): number => {
    const zone = (findZonesGroup(model.layout)?.objects ?? [])
        .filter(isZoneObject)
        .map(objectToZone)
        .find(({ kind }) => kind === "area");
    if (zone?.id === undefined) throw new Error("no area zone");
    return zone.id;
};

const from = { x: 3, y: 2, w: 4, h: 4 };

describe("buildZoneMoveOps", () => {
    it("carries the ground and the objects to the new place", () => {
        const model = buildModelWithStamp(3, 2, "area-floor");
        const to = { x: 8, y: 6, w: 4, h: 4 };

        const result = buildZoneMoveOps(model, zoneIdOf(model), from, to);
        if (!result.ok) throw new Error(JSON.stringify(result.errors));

        const moved = applyAll(model, result.ops).model;
        const width = model.layout.width;
        const before = findTileLayer(model.layout, "area-floor")!;
        const after = findTileLayer(moved.layout, "area-floor")!;

        // The area leaves nothing behind, and the ground of the map is intact.
        expect(after.data[2 * width + 3]).toBe(0);
        expect(findTileLayer(moved.layout, "ground")!.data).toEqual(
            findTileLayer(model.layout, "ground")!.data
        );
        expect(after.data[6 * width + 8]).toBe(before.data[2 * width + 3]);
        expect(moved.placed).toHaveLength(model.placed.length);
        for (const object of moved.placed) {
            expect(object.tileX).toBeGreaterThanOrEqual(8);
            expect(object.tileY).toBeGreaterThanOrEqual(6);
        }
    });

    it("moves an area one tile over its own place", () => {
        const model = buildModelWithStamp(3, 2, "area-floor");

        const result = buildZoneMoveOps(model, zoneIdOf(model), from, {
            ...from,
            x: 4,
        });

        expect(result.ok).toBe(true);
    });

    it("refuses a target outside the map", () => {
        const model = buildModelWithStamp(3, 2, "area-floor");

        const result = buildZoneMoveOps(model, zoneIdOf(model), from, {
            x: model.width - 1,
            y: 0,
            w: 4,
            h: 4,
        });

        expect(result.ok).toBe(false);
    });
});
