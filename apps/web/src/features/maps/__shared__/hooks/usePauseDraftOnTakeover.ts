import { useEffect } from "react";
import { EDIT_SCOPES } from "@standin/contracts";
import type { EditorLockLostReason, EditScopeKind } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { pauseDraft } from "@/features/maps/__shared__/lib/draftDb";

// When the Studio opens over a decorator (`MAP_EDITING`), the saved draft of
// the decorator is marked as paused, so the next open can offer to resume it.
// Any other reason, or the Studio mode itself, leaves the draft alone.
export const usePauseDraftOnTakeover = (
    mapId: string,
    mode: EditScopeKind,
    lostReason: EditorLockLostReason | null
) => {
    const { user } = useAuth();

    useEffect(() => {
        if (mode !== EDIT_SCOPES.OBJECTS) return;
        if (lostReason !== "MAP_EDITING") return;
        void pauseDraft(user.id, mapId, mode);
    }, [user.id, mapId, mode, lostReason]);
};
