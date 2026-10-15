import { describe, expect, it } from "vitest";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { createEditorStore } from "@/features/editor/lib/EditorStore";

const withChanges = () => {
    const store = createEditorStore();
    store.setDraftSummary({
        hasChanges: true,
        canUndo: true,
        canRedo: false,
    });
    return store;
};

describe("EditorStore lock", () => {
    it("starts editable", () => {
        const state = createEditorStore().getState();
        expect(state.lockStatus).toBe(LOCK_STATUS.HELD);
        expect(state.locked).toBe(false);
    });

    it("locks, drops the tool and cancels placing when the lock is lost", () => {
        const store = createEditorStore();
        store.setTool(EDITOR_TOOLS.PAINT);
        store.startPlacing("asset-1");

        store.setLockStatus(LOCK_STATUS.LOST);

        const state = store.getState();
        expect(state.locked).toBe(true);
        expect(state.lockStatus).toBe(LOCK_STATUS.LOST);
        expect(state.tool).toBe(EDITOR_TOOLS.PAN);
        expect(state.placing).toBeNull();
    });

    it("only lets the hand through while locked", () => {
        const store = createEditorStore();
        store.setLockStatus(LOCK_STATUS.LOST);

        store.setTool(EDITOR_TOOLS.PAINT);
        expect(store.getState().tool).toBe(EDITOR_TOOLS.PAN);

        store.startPlacing("asset-1");
        expect(store.getState().placing).toBeNull();

        store.pickTile({ tilesetId: "t", tileIndex: 1 } as never);
        expect(store.getState().brush).toBeNull();
    });

    it("does not open the publish dialog while locked", () => {
        const store = withChanges();
        store.setLockStatus(LOCK_STATUS.LOST);

        store.requestPublish();
        store.publishAndExit();

        expect(store.getState().dialog).toBeNull();
    });

    it("edits again when the lock is back", () => {
        const store = withChanges();
        store.setLockStatus(LOCK_STATUS.LOST);
        store.setLockStatus(LOCK_STATUS.HELD);

        store.setTool(EDITOR_TOOLS.PAINT);
        expect(store.getState().tool).toBe(EDITOR_TOOLS.PAINT);
        store.requestPublish();
        expect(store.getState().dialog).not.toBeNull();
    });
});
