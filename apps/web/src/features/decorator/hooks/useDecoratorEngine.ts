import { useEffect, useRef } from "react";
import { useAsRef } from "@/hooks/useAsRef";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationsQueries } from "@/features/organizations/queries";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { applyToolbarAnchor } from "@/features/editor/utils/applyToolbarAnchor";
import type { GameEngineHandle } from "@/features/game/types/game";

// Turns the game into the decorator for as long as the decorator is mounted,
// and gives it back when it goes away. The bar over the selected object and
// the hint line are written straight into the DOM by the scene, so a pointer
// move or a camera drag never renders React. The names of the members tell
// whose desk is whose, and are read when needed, so a list that arrives late
// does not restart the decorator.
export const useDecoratorEngine = (
    handle: GameEngineHandle | null,
    focusId: string | null
) => {
    const { user } = useAuth();
    const { members } = OrganizationsQueries.useMembers();
    const membersRef = useAsRef(members);
    const store = useEditorStore();
    const draftStore = useDraftStore();
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const hintRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!handle) return;

        return handle.startDecorator({
            store,
            draftStore,
            focusId,
            userId: user.id,
            getUserName: (userId) =>
                membersRef.current.find(({ id }) => id === userId)?.name ??
                null,
            onHint: (text) => {
                if (!hintRef.current) return;
                hintRef.current.textContent = text ?? "";
            },
            onSelectionAnchor: (anchor) =>
                applyToolbarAnchor(toolbarRef.current, anchor),
        });
    }, [handle, store, draftStore, focusId, user.id, membersRef]);

    return { toolbarRef, hintRef };
};
