import { describe, expect, it, vi } from "vitest";
import type { EditorModel, PublishResult } from "@standin/contracts";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createEditorStore } from "@/features/editor/lib/EditorStore";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";
import type { PublishInput } from "@/features/maps/__shared__/types/publish-input";
import { buildPublishedModel } from "@/features/maps/__shared__/utils/buildPublishedModel";
import { buildPublishInput } from "@/features/maps/__shared__/utils/buildPublishInput";
import { getPublishAttempt } from "@/features/maps/__shared__/utils/getPublishAttempt";
import { runPublish } from "@/features/maps/__shared__/utils/runPublish";

const buildBase = (revision: string | null = "r1"): EditorModel => ({
    ...buildModel([placedAt("crate-1", "crate", 0, 0)]),
    version: 3,
    objectsRevision: revision,
});

const remove = { type: "remove_asset", id: "crate-1" } as const;

const RESULT: PublishResult = {
    version: 3,
    objectsRevision: "r2",
    idMap: {},
    limits: { objectsUsed: 0, objectsMax: 100 },
};

const setup = (revision: string | null = "r1") => {
    const editorStore = createEditorStore();
    const draftStore = createDraftStore(
        buildBase(revision),
        editorStore.setDraftSummary
    );
    draftStore.dispatchGesture([remove]);
    return { editorStore, draftStore };
};

describe("getPublishAttempt for the objects scope", () => {
    it("is based on the objects revision, not on the layout version", () => {
        const { draftStore } = setup("r1");

        const attempt = getPublishAttempt(
            null,
            draftStore.getState(),
            () => "id-1",
            "objects"
        );

        expect(attempt).toEqual({
            publishId: "id-1",
            baseVersion: 3,
            scope: "objects",
            baseObjectsRevision: "r1",
            ops: [remove],
        });
    });

    it("keeps the publishId on a repeat and renews it when the base or the operations change", () => {
        const { draftStore } = setup("r1");
        const first = getPublishAttempt(
            null,
            draftStore.getState(),
            () => "id-1",
            "objects"
        );

        expect(
            getPublishAttempt(
                first,
                draftStore.getState(),
                () => "id-2",
                "objects"
            ).publishId
        ).toBe("id-1");

        const other = setup("r9");
        expect(
            getPublishAttempt(
                first,
                other.draftStore.getState(),
                () => "id-3",
                "objects"
            ).publishId
        ).toBe("id-3");
    });

    it("sends null when the map had no object", () => {
        const { draftStore } = setup(null);

        expect(
            getPublishAttempt(
                null,
                draftStore.getState(),
                () => "id",
                "objects"
            ).baseObjectsRevision
        ).toBeNull();
    });

    it("does not take the attempt of the Studio for the one of the decorator", () => {
        const { draftStore } = setup("r1");
        const studio = getPublishAttempt(
            null,
            draftStore.getState(),
            () => "studio"
        );

        expect(
            getPublishAttempt(
                studio,
                draftStore.getState(),
                () => "deco",
                "objects"
            ).publishId
        ).toBe("deco");
        expect(studio.scope).toBeUndefined();
    });
});

describe("buildPublishInput", () => {
    it("builds the request of the Studio with no scope, as it always was", () => {
        expect(
            buildPublishInput(
                { publishId: "p", baseVersion: 3, ops: [remove] },
                "map-1",
                "s1"
            )
        ).toEqual({
            mapId: "map-1",
            sessionId: "s1",
            publishId: "p",
            baseVersion: 3,
            ops: [remove],
        });
    });

    it("builds the request of the decorator with the scope and the revision", () => {
        expect(
            buildPublishInput(
                {
                    publishId: "p",
                    baseVersion: 3,
                    scope: "objects",
                    baseObjectsRevision: "r1",
                    ops: [remove],
                },
                "map-1",
                "s1"
            )
        ).toEqual({
            mapId: "map-1",
            sessionId: "s1",
            scope: "objects",
            publishId: "p",
            baseObjectsRevision: "r1",
            ops: [remove],
        });
    });
});

describe("runPublish for the objects scope", () => {
    it("sends the objects request and takes the new revision as the base", async () => {
        const { editorStore, draftStore } = setup("r1");
        const publish = vi.fn<(input: PublishInput) => Promise<PublishResult>>(
            async () => RESULT
        );
        const attempt = getPublishAttempt(
            null,
            draftStore.getState(),
            () => "id-1",
            "objects"
        );

        const outcome = await runPublish(
            {
                editorStore,
                draftStore,
                publish,
                clearSavedDraft: async () => {},
            },
            { attempt }
        );

        expect(outcome.ok).toBe(true);
        expect(publish).toHaveBeenCalledWith({
            mapId: "map-1",
            sessionId: editorStore.sessionId,
            scope: "objects",
            publishId: "id-1",
            baseObjectsRevision: "r1",
            ops: [remove],
        });
        expect(draftStore.getState().base.objectsRevision).toBe("r2");
        expect(draftStore.getState().ops).toEqual([]);
    });
});

describe("buildPublishedModel and the objects revision", () => {
    it("takes the revision of the answer and keeps the old one when there is none", () => {
        const draft = buildBase("r1");

        expect(buildPublishedModel(draft, RESULT).objectsRevision).toBe("r2");
        expect(
            buildPublishedModel(draft, {
                ...RESULT,
                objectsRevision: undefined,
            }).objectsRevision
        ).toBe("r1");
    });
});
