import { describe, expect, it } from "vitest";
import { EDITOR_STATUS_KIND } from "@/features/maps/__shared__/consts/editor-status-kind";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { getEditorStatus } from "@/features/maps/__shared__/utils/getEditorStatus";

const base = {
    hasChanges: false,
    publishPhase: PUBLISH_PHASE.IDLE,
    lockStatus: LOCK_STATUS.HELD,
} as const;

describe("getEditorStatus", () => {
    it("is clean with no changes", () => {
        expect(getEditorStatus(base)).toEqual({
            kind: EDITOR_STATUS_KIND.CLEAN,
        });
    });

    it("is draft with changes", () => {
        expect(getEditorStatus({ ...base, hasChanges: true })).toEqual({
            kind: EDITOR_STATUS_KIND.DRAFT,
        });
    });

    it("is publishing", () => {
        expect(
            getEditorStatus({
                ...base,
                hasChanges: true,
                publishPhase: PUBLISH_PHASE.PUBLISHING,
            })
        ).toEqual({ kind: EDITOR_STATUS_KIND.PUBLISHING });
    });

    it("is published", () => {
        expect(
            getEditorStatus({ ...base, publishPhase: PUBLISH_PHASE.PUBLISHED })
        ).toEqual({ kind: EDITOR_STATUS_KIND.PUBLISHED });
    });

    it("is error", () => {
        expect(
            getEditorStatus({
                ...base,
                hasChanges: true,
                publishPhase: PUBLISH_PHASE.ERROR,
            })
        ).toEqual({ kind: EDITOR_STATUS_KIND.ERROR });
    });

    it("is lock lost, above every other state", () => {
        expect(
            getEditorStatus({
                hasChanges: true,
                publishPhase: PUBLISH_PHASE.PUBLISHING,
                lockStatus: LOCK_STATUS.LOST,
            })
        ).toEqual({ kind: EDITOR_STATUS_KIND.LOCK_LOST });
    });

    it("ignores a lock that is not lost", () => {
        expect(
            getEditorStatus({ ...base, lockStatus: LOCK_STATUS.ACQUIRING })
        ).toEqual({ kind: EDITOR_STATUS_KIND.CLEAN });
    });
});
