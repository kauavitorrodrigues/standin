import { describe, expect, it } from "vitest";
import {
    ASSET_ACTIONS,
    ASSET_CATEGORIES,
    ASSET_PLACEMENTS,
    ASSET_ROTATIONS,
    ASSET_TYPES,
    validateFamily,
} from "@standin/contracts";
import { IN_USE_EDITABLE_ASSET_FIELDS } from "../../consts/fields";
import {
    applyPlan,
    findRowIssues,
    planChanges,
    toPatch,
} from "../planAssetUpdate";
import { buildAssetDefinition } from "../buildAssetDefinition";
import { assetRow, chairSeats } from "./fixtures";

// Base red mug, blue mug, green mug.
const redMug = assetRow();
const blueMug = assetRow({
    id: "mug-blue",
    baseAssetId: "mug-red",
    key: "mug-blue",
    colorKey: "blue",
    colorHex: "#3F6FD1",
});
const greenMug = assetRow({
    id: "mug-green",
    baseAssetId: "mug-red",
    key: "mug-green",
    colorKey: "green",
    colorHex: "#4CA36B",
});
const family = [redMug, blueMug, greenMug];

const run = (
    target: typeof redMug,
    body: Parameters<typeof planChanges>[1]
) => {
    const plan = planChanges(target, body, body.category as undefined);
    return { plan, rows: applyPlan(family, target, plan) };
};

describe("planChanges and applyPlan", () => {
    it("applies a family field to every row of the family", () => {
        const { plan, rows } = run(blueMug, {
            name: "Caneca grande",
            solid: true,
        });

        expect(plan.fields).toEqual(["name", "solid"]);
        expect(rows.every((row) => row.name === "Caneca grande")).toBe(true);
        expect(rows.every((row) => row.solid)).toBe(true);
    });

    it("applies the footprint only to the colors of the same rotation", () => {
        const wide = assetRow({
            id: "wide-oak",
            baseAssetId: "mug-red",
            key: "wide-oak",
            colorKey: "oak",
            colorHex: "#B98B5E",
            rotation: ASSET_ROTATIONS.DEG_90,
            spriteW: 64,
            footprintW: 2,
        });
        const plan = planChanges(
            redMug,
            { footprint: { w: 2, h: 1, offsetX: 0 } },
            undefined
        );
        const applied = applyPlan([...family, wide], redMug, plan);

        expect(
            applied
                .filter((row) => row.rotation === null)
                .map((row) => row.footprintW)
        ).toEqual([2, 2, 2]);
        expect(applied.find(({ id }) => id === "wide-oak")?.footprintW).toBe(2);
    });

    it("applies the color only to the row itself", () => {
        const { plan, rows } = run(blueMug, {
            color: { key: "navy", hex: "#1F3A8A" },
        });

        expect(plan.fields).toEqual(["color"]);
        expect(rows.find(({ id }) => id === "mug-blue")?.colorKey).toBe("navy");
        expect(rows.find(({ id }) => id === "mug-red")?.colorKey).toBe("red");
    });

    it("applies the frame duration and repeat to every strip of the family", () => {
        const animation = { frameCount: 4, frameDurationMs: 100, repeat: -1 };
        const strips = [
            assetRow({ animation }),
            assetRow({
                id: "b",
                baseAssetId: "mug-red",
                key: "b",
                colorKey: "blue",
                colorHex: "#3F6FD1",
                animation,
            }),
        ];
        const plan = planChanges(
            strips[0]!,
            { animation: { frameDurationMs: 250 } },
            undefined
        );
        const rows = applyPlan(strips, strips[0]!, plan);

        expect(rows.map((row) => row.animation)).toEqual([
            { frameCount: 4, frameDurationMs: 250, repeat: -1 },
            { frameCount: 4, frameDurationMs: 250, repeat: -1 },
        ]);
    });

    it("drops the action params of every rotation when the action is removed", () => {
        const chair = assetRow({
            type: ASSET_TYPES.CHAIR,
            category: ASSET_CATEGORIES.SITTING,
            action: ASSET_ACTIONS.SIT,
            actionParams: chairSeats,
            placement: ASSET_PLACEMENTS.GROUND,
        });
        const plan = planChanges(chair, { action: null }, undefined);
        const [row] = applyPlan([chair], chair, plan);

        expect(row?.action).toBeNull();
        expect(row?.actionParams).toBeNull();
        expect(findRowIssues([row!])).toEqual([]);
    });

    it("ignores values that only repeat what is stored", () => {
        const { plan } = run(redMug, {
            name: redMug.name,
            color: { key: "red", hex: "#D64545" },
        });

        expect(plan.fields).toEqual([]);
    });

    it("tells the fields that stay editable in use from the locked ones", () => {
        const { plan } = run(redMug, {
            name: "Outra",
            promptText: "oi",
            category: ASSET_CATEGORIES.ROOM_DECOR,
            solid: true,
        });
        const locked = plan.fields.filter(
            (field) =>
                !(IN_USE_EDITABLE_ASSET_FIELDS as readonly string[]).includes(
                    field
                )
        );

        expect(locked).toEqual(["solid"]);
    });

    it("keeps the family valid and builds only the columns that changed", () => {
        const { rows } = run(blueMug, { name: "Caneca grande" });

        expect(
            validateFamily(rows.map((row) => buildAssetDefinition(row, "")))
        ).toEqual([]);
        expect(toPatch(blueMug, rows[1]!)).toEqual({ name: "Caneca grande" });
    });

    it("lets validateFamily catch a color change that breaks the family", () => {
        const { rows } = run(blueMug, {
            color: { key: "red", hex: "#D64545" },
        });

        const issues = validateFamily(
            rows.map((row) => buildAssetDefinition(row, ""))
        );
        expect(issues.map(({ code }) => code)).toContain("VARIANT_DUPLICATED");
    });
});
