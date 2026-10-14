import { useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDraftStore } from "@/features/maps/__shared__/hooks/useDraftStore";
import { clearDraft } from "@/features/maps/__shared__/lib/draftDb";

// Throws the draft away: the store goes back to the base and the saved copy is
// removed from IndexedDB.
export const useDiscardDraft = () => {
    const { user } = useAuth();
    const draftStore = useDraftStore();

    return useCallback(async () => {
        const { mapId } = draftStore.getState().base;
        draftStore.discard();
        await clearDraft(user.id, mapId);
    }, [draftStore, user.id]);
};
