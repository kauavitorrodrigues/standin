import { describe, expect, it } from "vitest";
import { LAYOUT_ISSUE_CODES } from "@standin/contracts";
import type { LayoutIssueCode } from "@standin/contracts";
import { PLACEMENT_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { describePlacementReason } from "@/features/maps/__shared__/utils/describePlacementReason";
import { findSurfaceParent } from "@/features/maps/__shared__/utils/findSurfaceParent";
import { getPlacementHint } from "@/features/maps/__shared__/utils/getPlacementHint";
import { planPlacement } from "@/features/maps/__shared__/utils/planPlacement";
import { snapToSurface } from "@/features/maps/__shared__/utils/snapToSurface";
import {
    buildModel,
    crate,
    desk,
    monitor,
    placedAt,
    wideItem,
} from "./placementTestKit";

describe("describePlacementReason", () => {
    const cases: [LayoutIssueCode, string][] = [
        ["CELL_OUT_OF_BOUNDS", PLACEMENT_MESSAGES.OUT_OF_BOUNDS],
        ["TOO_MANY_OBJECTS", PLACEMENT_MESSAGES.LIMIT_REACHED],
        ["FOOTPRINT_OVERLAP", PLACEMENT_MESSAGES.OVERLAP],
        ["CELL_OCCUPIED_BY_OBJECT", PLACEMENT_MESSAGES.OVERLAP],
        ["NOT_ON_SURFACE", PLACEMENT_MESSAGES.NOT_ON_SURFACE],
        ["NOT_ON_WALL", PLACEMENT_MESSAGES.NOT_ON_WALL],
        ["CELL_BLOCKED_BY_WALL", PLACEMENT_MESSAGES.BLOCKED_BY_WALL],
        ["ASSET_NOT_IN_LIBRARY", PLACEMENT_MESSAGES.NOT_IN_LIBRARY],
        ["SPAWN_MISSING", PLACEMENT_MESSAGES.GENERIC],
    ];

    it.each(cases)("translates %s", (code, message) => {
        expect(describePlacementReason(code)).toBe(message);
    });

    it("gives the nudge when the spot is fine", () => {
        expect(getPlacementHint({ ok: true })).toBe(PLACEMENT_MESSAGES.READY);
        expect(
            getPlacementHint({
                ok: false,
                reason: LAYOUT_ISSUE_CODES.NOT_ON_SURFACE,
            })
        ).toBe(PLACEMENT_MESSAGES.NOT_ON_SURFACE);
    });
});

describe("findSurfaceParent", () => {
    const model = buildModel([
        placedAt("desk-1", "desk", 2, 4),
        placedAt("crate-1", "crate", 6, 4),
    ]);

    it("finds the desk whose top covers the cell", () => {
        expect(findSurfaceParent(model, [3, 4])?.id).toBe("desk-1");
        expect(findSurfaceParent(model, [4, 4])?.id).toBe("desk-1");
    });

    it("ignores objects that take nothing on top and empty cells", () => {
        expect(findSurfaceParent(model, [6, 4])).toBeNull();
        expect(findSurfaceParent(model, [0, 0])).toBeNull();
    });
});

describe("snapToSurface", () => {
    const parent = placedAt("desk-1", "desk", 2, 4);

    it("keeps the cell when the item fits there", () => {
        expect(snapToSurface([3, 4], monitor, parent, desk)).toEqual([3, 4]);
    });

    it("pulls a wide item back inside the top", () => {
        expect(snapToSurface([4, 4], wideItem, parent, desk)).toEqual([3, 4]);
        expect(snapToSurface([2, 4], wideItem, parent, desk)).toEqual([2, 4]);
    });
});

describe("planPlacement", () => {
    it("places on the cursor cell when it is free", () => {
        const plan = planPlacement(buildModel(), "crate", [3, 3]);
        expect(plan).toMatchObject({
            tileX: 3,
            tileY: 3,
            parentId: null,
            result: { ok: true },
        });
        expect(plan.asset).toBe(crate);
    });

    it("refuses an occupied cell with the overlap code", () => {
        const model = buildModel([placedAt("crate-1", "crate", 3, 3)]);
        expect(planPlacement(model, "crate", [3, 3]).result).toEqual({
            ok: false,
            reason: LAYOUT_ISSUE_CODES.FOOTPRINT_OVERLAP,
        });
    });

    it("refuses a footprint that leaves the map", () => {
        expect(planPlacement(buildModel(), "desk", [8, 3]).result).toEqual({
            ok: false,
            reason: LAYOUT_ISSUE_CODES.CELL_OUT_OF_BOUNDS,
        });
    });

    it("refuses when the object meter is full", () => {
        const model = buildModel([placedAt("crate-1", "crate", 0, 0)], 1);
        expect(planPlacement(model, "crate", [5, 5]).result).toEqual({
            ok: false,
            reason: LAYOUT_ISSUE_CODES.TOO_MANY_OBJECTS,
        });
    });

    it("refuses an asset that is not in the palette", () => {
        const plan = planPlacement(buildModel(), "ghost-asset", [1, 1]);
        expect(plan.asset).toBeNull();
        expect(plan.result).toEqual({
            ok: false,
            reason: LAYOUT_ISSUE_CODES.ASSET_NOT_IN_LIBRARY,
        });
    });

    it("sets the desk as parent of a SURFACE item over its top", () => {
        const model = buildModel([placedAt("desk-1", "desk", 2, 4)]);
        const plan = planPlacement(model, "monitor", [3, 4]);
        expect(plan).toMatchObject({
            tileX: 3,
            tileY: 4,
            parentId: "desk-1",
            result: { ok: true },
        });
    });

    it("snaps a wide SURFACE item onto the top", () => {
        const model = buildModel([placedAt("desk-1", "desk", 2, 4)]);
        const plan = planPlacement(model, "wide", [4, 4]);
        expect(plan).toMatchObject({
            tileX: 3,
            tileY: 4,
            parentId: "desk-1",
            result: { ok: true },
        });
    });

    it("has no parent and refuses a SURFACE item off any top", () => {
        const model = buildModel([placedAt("desk-1", "desk", 2, 4)]);
        const plan = planPlacement(model, "monitor", [7, 7]);
        expect(plan.parentId).toBeNull();
        expect(plan.result).toEqual({
            ok: false,
            reason: LAYOUT_ISSUE_CODES.NOT_ON_SURFACE,
        });
    });

    it("refuses a second item on the same cells of the top", () => {
        const model = buildModel([
            placedAt("desk-1", "desk", 2, 4),
            placedAt("monitor-1", "monitor", 3, 4, "desk-1"),
        ]);
        expect(planPlacement(model, "monitor", [3, 4]).result).toEqual({
            ok: false,
            reason: LAYOUT_ISSUE_CODES.FOOTPRINT_OVERLAP,
        });
    });
});
