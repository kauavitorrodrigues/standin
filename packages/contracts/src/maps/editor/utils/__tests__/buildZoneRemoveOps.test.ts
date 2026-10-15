import { describe, expect, it } from "vitest";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { isZoneObject, objectToZone } from "../../../layout/zone";
import { buildZoneRemoveOps } from "../buildZoneRemoveOps";
import { applyAll, buildModelWithStamp } from "./stampTestKit";

const rect = { x: 3, y: 2, w: 4, h: 4 };

describe("buildZoneRemoveOps", () => {
    it("removes the zone, its objects and its tiles", () => {
        const model = buildModelWithStamp(3, 2, "area-floor");
        const zone = (findZonesGroup(model.layout)?.objects ?? [])
            .filter(isZoneObject)
            .map(objectToZone)
            .find(({ kind }) => kind === "area");
        if (zone?.id === undefined) throw new Error("no area zone");

        const result = buildZoneRemoveOps(model, zone.id, rect);
        if (!result.ok) throw new Error("refused");

        const after = applyAll(model, result.ops).model;
        expect(after.placed).toHaveLength(0);
        const zones = (findZonesGroup(after.layout)?.objects ?? [])
            .filter(isZoneObject)
            .map(objectToZone);
        expect(zones.some(({ kind }) => kind === "area")).toBe(false);
    });
});
