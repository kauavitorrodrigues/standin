import { useEffect } from "react";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import { clearDraft, saveDraft } from "@/features/maps/__shared__/lib/draftDb";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";
import { createDraftSaver } from "@/features/maps/__shared__/utils/createDraftSaver";

// Keeps IndexedDB in step with the effective operations of the draft. It does
// nothing while `enabled` is false, which is until the user decided what to do
// with a saved draft (resume, discard, or there was none), so that draft is
// never overwritten or cleared by the empty one the editor opens with. After
// that it acts only when `ops` changes.
export const useDraftPersistence = (
    store: DraftStore,
    userId: string,
    mapId: string,
    enabled: boolean
) => {
    useEffect(() => {
        if (!enabled) return;

        const saver = createDraftSaver<StoredDraft>((value) =>
            saveDraft(userId, mapId, value)
        );
        let lastOps = store.getState().ops;

        const unsubscribe = store.subscribe(() => {
            const { ops, base } = store.getState();
            if (ops === lastOps) return;
            lastOps = ops;

            if (ops.length === 0) {
                saver.cancel();
                void clearDraft(userId, mapId);
                return;
            }
            saver.save({ baseVersion: base.version, ops });
        });

        return () => {
            unsubscribe();
            void saver.flush();
        };
    }, [store, userId, mapId, enabled]);
};
