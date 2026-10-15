import type { assetsTable } from "@standin/database";
import type {
    LibraryIssue,
    UpdateLibraryAssetSchemaType,
    AssetCategory,
} from "@standin/contracts";
import type { AssetRow } from "../types";
import { stableJson } from "../library/utils/stableJson";
import { findActionParamsIssue, findFootprintIssue } from "./ruleIssues";

// The body of the HTTP route plus the two fields only the seed sets, straight
// on the service: the footprint is bound to the PNG and the color has its own
// route. The schema of the route rejects both.
export type UpdateBody = UpdateLibraryAssetSchemaType & {
    footprint?: { w: number; h: number; offsetX?: number };
    color?: { key: string; hex: string } | null;
};
export type Patch = Partial<Omit<typeof assetsTable.$inferInsert, "id">>;

const differs = (a: unknown, b: unknown) => stableJson(a) !== stableJson(b);

// What the body changes, split by who it reaches (spec, section 4.1).
export type Plan = {
    // Body fields that really change a value, for the in-use check.
    fields: string[];
    family: Patch;
    animation: { frameDurationMs?: number; repeat?: number } | null;
    rotationGroup: Patch;
    ownRow: Patch;
    clearActionParams: boolean;
};

export const planChanges = (
    target: AssetRow,
    body: UpdateBody,
    category: AssetCategory | undefined
): Plan => {
    const plan: Plan = {
        fields: [],
        family: {},
        animation: null,
        rotationGroup: {},
        ownRow: {},
        clearActionParams: false,
    };
    const change = (field: string) => plan.fields.push(field);

    if (body.name !== undefined && body.name !== target.name) {
        plan.family.name = body.name;
        change("name");
    }
    if (category !== undefined && category !== target.category) {
        plan.family.category = category;
        change("category");
    }
    if (body.placement !== undefined && body.placement !== target.placement) {
        plan.family.placement = body.placement;
        change("placement");
    }
    if (body.solid !== undefined && body.solid !== target.solid) {
        plan.family.solid = body.solid;
        change("solid");
    }
    if (
        body.surfaceHeightPx !== undefined &&
        body.surfaceHeightPx !== target.surfaceHeightPx
    ) {
        plan.family.surfaceHeightPx = body.surfaceHeightPx;
        change("surfaceHeightPx");
    }
    if (body.action !== undefined && body.action !== target.action) {
        plan.family.action = body.action;
        // No action, no params: every rotation drops them together.
        plan.clearActionParams = body.action === null;
        change("action");
    }
    if (
        body.promptText !== undefined &&
        body.promptText !== target.promptText
    ) {
        plan.family.promptText = body.promptText;
        change("promptText");
    }

    const { frameDurationMs, repeat } = body.animation ?? {};
    const animation = target.animation;
    const durationChanged =
        frameDurationMs !== undefined &&
        frameDurationMs !== animation?.frameDurationMs;
    const repeatChanged = repeat !== undefined && repeat !== animation?.repeat;
    if (durationChanged || repeatChanged) {
        plan.animation = { frameDurationMs, repeat };
        change("animation");
    }

    if (body.footprint !== undefined) {
        const footprint = {
            footprintW: body.footprint.w,
            footprintH: body.footprint.h,
            footprintOffsetX: body.footprint.offsetX ?? 0,
        };
        const current = {
            footprintW: target.footprintW,
            footprintH: target.footprintH,
            footprintOffsetX: target.footprintOffsetX,
        };
        if (differs(footprint, current)) {
            Object.assign(plan.rotationGroup, footprint);
            change("footprint");
        }
    }
    if (
        body.actionParams !== undefined &&
        differs(body.actionParams, target.actionParams)
    ) {
        plan.rotationGroup.actionParams = body.actionParams;
        change("actionParams");
    }

    if (body.rotation !== undefined && body.rotation !== target.rotation) {
        plan.ownRow.rotation = body.rotation;
        change("rotation");
    }
    if (body.color !== undefined) {
        const colorKey = body.color?.key ?? null;
        const colorHex = body.color?.hex ?? null;
        if (colorKey !== target.colorKey || colorHex !== target.colorHex) {
            plan.ownRow.colorKey = colorKey;
            plan.ownRow.colorHex = colorHex;
            change("color");
        }
    }
    return plan;
};

export const applyPlan = (
    rows: AssetRow[],
    target: AssetRow,
    plan: Plan
): AssetRow[] =>
    rows.map((row) => {
        let next: AssetRow = { ...row, ...(plan.family as Partial<AssetRow>) };
        if (plan.animation && next.animation) {
            next = {
                ...next,
                animation: {
                    ...next.animation,
                    ...(plan.animation.frameDurationMs !== undefined
                        ? { frameDurationMs: plan.animation.frameDurationMs }
                        : {}),
                    ...(plan.animation.repeat !== undefined
                        ? { repeat: plan.animation.repeat }
                        : {}),
                },
            };
        }
        if (plan.clearActionParams) next = { ...next, actionParams: null };
        if (row.rotation === target.rotation) {
            next = { ...next, ...(plan.rotationGroup as Partial<AssetRow>) };
        }
        if (row.id === target.id) {
            next = { ...next, ...(plan.ownRow as Partial<AssetRow>) };
        }
        return next;
    });

// The columns that differ between the stored row and the planned one.
export const toPatch = (before: AssetRow, after: AssetRow): Patch => {
    const { fileName: _fileName, ...columns } = after;
    const patch: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(columns)) {
        if (differs(value, before[field as keyof AssetRow])) {
            patch[field] = value;
        }
    }
    return patch as Patch;
};

export const findRowIssues = (rows: AssetRow[]): LibraryIssue[] =>
    rows.flatMap((row) => {
        const footprintIssue = findFootprintIssue(
            {
                w: row.footprintW,
                h: row.footprintH,
                offsetX: row.footprintOffsetX,
            },
            { w: row.spriteW, h: row.spriteH }
        );
        const actionIssue = findActionParamsIssue(row.action, row.actionParams);
        return [footprintIssue, actionIssue].filter(
            (issue): issue is LibraryIssue => issue !== null
        );
    });
