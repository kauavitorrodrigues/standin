import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import type { EmbeddedWebsiteParams } from "../../../behaviors/schemas";
import { buildLayout, library } from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import { EDIT_SCOPES } from "../../consts/edit-scopes";
import { EditorOpSchema } from "../../schemas/editorOp.schema";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import { applyEditorOp } from "../applyEditorOp";
import { assertOpsInScope } from "../assertOpsInScope";
import { replayOps } from "../replayOps";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        category: "ROOM_DECOR",
        type: "TV",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        baseAssetId: null,
        rotation: null,
        colorKey: null,
        action: null,
        actionParams: null,
        behavior: "NONE",
        ...overrides,
    }) as AssetDefinition;

// Two assets with a website behavior, one plain asset and one with an action.
const screen = asset({ id: "screen", behavior: "EMBEDDED_WEBSITE" });
const otherScreen = asset({ id: "other-screen", behavior: "EMBEDDED_WEBSITE" });
const plainTv = asset({ id: "plain-tv" });
const chair = asset({
    id: "chair",
    action: "SIT",
    actionParams: { seats: [{ dx: 0, dy: 0, facing: "DOWN" }] },
});

const website: EmbeddedWebsiteParams = {
    mode: "url",
    url: "https://example.com",
};

const placedAt = (
    id: string,
    assetId: string,
    behaviorParams: PlacedAsset["behaviorParams"] = null
): PlacedAsset => ({
    id,
    assetId,
    tileX: 3,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    propertyOverrides: null,
    behaviorParams,
});

const buildModel = (placed: PlacedAsset[]): EditorModel => {
    const layout = buildLayout();
    return {
        mapId: "map-1",
        width: layout.width,
        height: layout.height,
        layout,
        placed,
        library: {
            tilesets: Object.values(library.tilesets).map(
                ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
            ),
            assets: [screen, otherScreen, plainTv, chair],
            categories: [],
            areas: [],
        } as unknown as LibraryPalette,
        desks: [],
        limits: { objectsUsed: placed.length, objectsMax: 100 },
        version: 1,
        appOrigins: ["https://standin.example"],
    };
};

const setBehavior = (
    id: string,
    params: EmbeddedWebsiteParams | null
): EditorOp => ({ type: "set_behavior", id, params });

describe("set_behavior", () => {
    it("stores the params on an object whose asset has the behavior", () => {
        const result = applyEditorOp(
            buildModel([placedAt("o1", "screen")]),
            setBehavior("o1", website)
        );
        if (!result.ok) throw new Error("expected ok");
        expect(result.model.placed[0].behaviorParams).toEqual(website);
    });

    it("replaces the params, and null clears them", () => {
        const first = applyEditorOp(
            buildModel([placedAt("o1", "screen", website)]),
            setBehavior("o1", {
                mode: "derived",
                prefix: "https://meet.example/room-",
            })
        );
        if (!first.ok) throw new Error("expected ok");
        expect(first.model.placed[0].behaviorParams).toEqual({
            mode: "derived",
            prefix: "https://meet.example/room-",
        });

        const second = applyEditorOp(first.model, setBehavior("o1", null));
        if (!second.ok) throw new Error("expected ok");
        expect(second.model.placed[0].behaviorParams).toBeNull();
    });

    it("undoes with the previous params", () => {
        const model = buildModel([placedAt("o1", "screen", website)]);
        const result = applyEditorOp(model, setBehavior("o1", null));
        if (!result.ok) throw new Error("expected ok");

        const undone = replayOps(result.model, result.inverse);
        if (!undone.ok) throw new Error("expected ok");
        expect(undone.model.placed[0].behaviorParams).toEqual(website);
    });

    it("refuses an object that does not exist", () => {
        const result = applyEditorOp(
            buildModel([]),
            setBehavior("missing", website)
        );
        expect(result).toMatchObject({
            ok: false,
            errors: [{ code: Code.OBJECT_NOT_FOUND }],
        });
    });

    it("refuses params on an object whose asset has no behavior", () => {
        for (const assetId of ["plain-tv", "chair"]) {
            const result = applyEditorOp(
                buildModel([placedAt("o1", assetId)]),
                setBehavior("o1", website)
            );
            expect(result).toMatchObject({
                ok: false,
                errors: [{ code: Code.BEHAVIOR_NOT_ON_ASSET }],
            });
        }
    });

    it("refuses an unsafe address and the address of the app", () => {
        for (const url of [
            "http://example.com",
            "javascript:alert(1)",
            "https://standin.example/space",
        ]) {
            const result = applyEditorOp(
                buildModel([placedAt("o1", "screen")]),
                setBehavior("o1", { mode: "url", url })
            );
            expect(result).toMatchObject({
                ok: false,
                errors: [{ code: Code.BEHAVIOR_URL_INVALID }],
            });
        }
    });

    it("does not take params of a reserved behavior", () => {
        expect(
            EditorOpSchema.safeParse({
                type: "set_behavior",
                id: "o1",
                params: { kind: "WEBHOOK" },
            }).success
        ).toBe(false);
    });
});

describe("params follow the behavior of the asset", () => {
    it("clears the params when the object takes an asset with another behavior", () => {
        const model = buildModel([placedAt("o1", "screen", website)]);
        const result = applyEditorOp(model, {
            type: "replace_asset",
            id: "o1",
            assetId: "plain-tv",
        });
        if (!result.ok) throw new Error("expected ok");
        expect(result.model.placed[0].behaviorParams).toBeNull();

        const undone = replayOps(result.model, result.inverse);
        if (!undone.ok) throw new Error("expected ok");
        expect(undone.model.placed[0].assetId).toBe("screen");
        expect(undone.model.placed[0].behaviorParams).toEqual(website);
    });

    it("keeps the params when the new asset has the same behavior", () => {
        const model = buildModel([placedAt("o1", "screen", website)]);
        const result = applyEditorOp(model, {
            type: "replace_asset",
            id: "o1",
            assetId: "other-screen",
        });
        if (!result.ok) throw new Error("expected ok");
        expect(result.model.placed[0].behaviorParams).toEqual(website);
    });

    it("places new objects without params", () => {
        const result = applyEditorOp(buildModel([]), {
            type: "place_asset",
            tempId: "new",
            assetId: "screen",
            tileX: 3,
            tileY: 5,
        });
        if (!result.ok) throw new Error("expected ok");
        expect(result.model.placed[0].behaviorParams).toBeNull();
    });
});

describe("undoing a remove", () => {
    it("brings the object back with its params", () => {
        const model = buildModel([placedAt("o1", "screen", website)]);
        const removed = applyEditorOp(model, {
            type: "remove_asset",
            id: "o1",
        });
        if (!removed.ok) throw new Error("expected ok");
        expect(removed.model.placed).toEqual([]);

        const undone = replayOps(removed.model, removed.inverse);
        if (!undone.ok) throw new Error("expected ok");
        expect(undone.model.placed).toHaveLength(1);
        expect(undone.model.placed[0]).toMatchObject({
            id: "o1",
            assetId: "screen",
            behaviorParams: website,
        });
    });

    it("does not add an op for an object without params", () => {
        const model = buildModel([placedAt("o1", "screen")]);
        const removed = applyEditorOp(model, {
            type: "remove_asset",
            id: "o1",
        });
        if (!removed.ok) throw new Error("expected ok");
        expect(removed.inverse.map(({ type }) => type)).toEqual([
            "place_asset",
        ]);
    });
});

describe("set_behavior scope", () => {
    const ops = [setBehavior("o1", website)];
    const issuesFor = (
        scope: string,
        actor: { userId: string; canEdit?: boolean }
    ) =>
        assertOpsInScope(
            ops,
            { kind: scope as "map" | "objects" },
            actor,
            buildModel([placedAt("o1", "screen")])
        );

    it("is refused in the objects scope for a member who only decorates", () => {
        expect(issuesFor(EDIT_SCOPES.OBJECTS, { userId: "u1" })).toMatchObject([
            { code: Code.OUT_OF_SCOPE },
        ]);
        expect(
            issuesFor(EDIT_SCOPES.OBJECTS, { userId: "u1", canEdit: false })
        ).toMatchObject([{ code: Code.OUT_OF_SCOPE }]);
    });

    it("is allowed in the objects scope for an owner or an editor", () => {
        expect(
            issuesFor(EDIT_SCOPES.OBJECTS, { userId: "u1", canEdit: true })
        ).toEqual([]);
    });

    it("is allowed in the map scope", () => {
        expect(issuesFor(EDIT_SCOPES.MAP, { userId: "u1" })).toEqual([]);
    });

    it("keeps the tile operations out of the objects scope for an editor", () => {
        const issues = assertOpsInScope(
            [{ type: "set_background", color: "#222222" }],
            { kind: EDIT_SCOPES.OBJECTS },
            { userId: "u1", canEdit: true },
            buildModel([])
        );
        expect(issues).toMatchObject([{ code: Code.OUT_OF_SCOPE }]);
    });
});
