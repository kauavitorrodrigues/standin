import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import { EditorAcquiringState } from "@/features/maps/__shared__/components/views/EditorAcquiringState";
import { EditorLockDeniedState } from "@/features/maps/__shared__/components/views/EditorLockDeniedState";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { EditorLockContext } from "@/features/maps/__shared__/contexts/EditorLockContext";
import { useEditorLock } from "@/features/maps/__shared__/hooks/useEditorLock";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { usePauseDraftOnTakeover } from "@/features/maps/__shared__/hooks/usePauseDraftOnTakeover";
import { useLockStatusSync } from "@/features/maps/__shared__/hooks/useLockStatusSync";
import { clearEditorQueries } from "@/features/maps/__shared__/utils/clearEditorQueries";

type EditorLockGateProps = {
    mapId: string;
    // What the lock is for. The Studio takes the whole map.
    mode?: EditScopeKind;
    onExit: () => void;
    children: ReactNode;
};

// The editor opens only after the lock is granted (spec 8.1): the map and the
// palette load below this gate. A lost lock keeps the editor mounted, blocked,
// so the draft is not thrown away while it is got back.
export const EditorLockGate = ({
    mapId,
    mode = EDIT_SCOPES.MAP,
    onExit,
    children,
}: EditorLockGateProps) => {
    const store = useEditorStore();
    const queryClient = useQueryClient();
    const { lock, control, lostReason } = useEditorLock(
        mapId,
        store.sessionId,
        () => clearEditorQueries(queryClient, mapId),
        mode
    );
    useLockStatusSync(lock.status);
    usePauseDraftOnTakeover(mapId, mode, lostReason);

    switch (lock.status) {
        case LOCK_STATUS.ACQUIRING:
            return <EditorAcquiringState />;
        case LOCK_STATUS.DENIED:
            return <EditorLockDeniedState lock={lock} onExit={onExit} />;
        case LOCK_STATUS.HELD:
        case LOCK_STATUS.LOST:
            return (
                <EditorLockContext.Provider value={control}>
                    {children}
                </EditorLockContext.Provider>
            );
    }
};
