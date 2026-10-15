import { useCallback } from "react";
import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { clearDraft } from "@/features/maps/__shared__/lib/draftDb";

// Throws the draft away: the store goes back to the base and the saved copy is
// removed from IndexedDB.
export const useDiscardDraft = (mode: EditScopeKind = EDIT_SCOPES.MAP) => {
    const { user } = useAuth();
    const draftStore = useDraftStore();

    return useCallback(async () => {
        const { mapId } = draftStore.getState().base;
        draftStore.discard();
        await clearDraft(user.id, mapId, mode);
    }, [draftStore, user.id, mode]);
};
