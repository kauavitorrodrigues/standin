import { describe, expect, it } from "vitest";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { TILE_SIZE } from "../../../consts/constants";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { buildStampOps } from "../buildStampOps";
import { captureStamp } from "../captureStamp";
import { stampToModel } from "../stampToModel";
import {
    buildMapModel,
    buildModelWithStamp,
    buildStamp,
    palette,
    tempIds,
} from "./stampTestKit";

const captured = () => {
    const result = captureStamp(
        buildModelWithStamp(3, 2),
        { x: 3, y: 2, w: 4, h: 4 },
        { zoneLabel: "Sala" }
    );
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    return result.stamp;
};

describe("stamp round trip", () => {
    it("captures a model and places it elsewhere with the same content", () => {
        const stamp = captured();
        const placed = buildStampOps(buildMapModel(), stamp, 6, 1, tempIds());
        if (!placed.ok) throw new Error(JSON.stringify(placed.errors));

        const again = captureStamp(
            placed.model,
            { x: 6, y: 1, w: 4, h: 4 },
            { zoneLabel: "Sala" }
        );

        expect(again.ok && again.stamp).toEqual(stamp);
    });

    it("keeps the offsets, the parent links and creates the zone", () => {
        const placed = buildStampOps(
            buildMapModel(),
            captured(),
            6,
            1,
            tempIds()
        );
        if (!placed.ok) throw new Error(JSON.stringify(placed.errors));

        const table = placed.model.placed.find(
            ({ assetId }) => assetId === "table"
        );
        const monitor = placed.model.placed.find(
            ({ assetId }) => assetId === "monitor"
        );
        expect(table).toMatchObject({
            tileX: 7,
            tileY: 3,
            offsetX: 3,
            offsetY: -4,
        });
        expect(monitor?.parentId).toBe(table?.id);

        const zone = findZonesGroup(placed.model.layout)?.objects.find(
            ({ name }) => name === "area"
        );
        expect(zone).toMatchObject({
            x: 6 * TILE_SIZE,
            y: 1 * TILE_SIZE,
            width: 4 * TILE_SIZE,
            height: 4 * TILE_SIZE,
        });
    });

    it("opens a stamp as a model and captures the same stamp back", () => {
        const stamp = captured();
        const opened = stampToModel(stamp, palette);
        if (!opened.ok) throw new Error(JSON.stringify(opened.errors));

        expect(opened.zoneLabel).toBe("Sala");
        expect(opened.model.width).toBe(4);
        expect(opened.model.height).toBe(4);
        expect(findZonesGroup(opened.model.layout)?.objects).toEqual([]);

        const again = captureStamp(
            opened.model,
            { x: 0, y: 0, w: 4, h: 4 },
            { zoneLabel: opened.zoneLabel }
        );
        expect(again.ok && again.stamp).toEqual(stamp);
    });

    it("answers a null zone label for a stamp without a zone", () => {
        const opened = stampToModel({ ...buildStamp(), zone: null }, palette);

        expect(opened.ok && opened.zoneLabel).toBeNull();
    });

    it("answers the errors when the library no longer allows the stamp", () => {
        const library = {
            ...palette,
            assets: palette.assets.filter(({ id }) => id !== "chair"),
        };

        const opened = stampToModel(captured(), library);

        expect(opened.ok).toBe(false);
        if (!opened.ok) {
            expect(opened.errors[0]?.code).toBe(Code.ASSET_NOT_IN_LIBRARY);
        }
    });
});
