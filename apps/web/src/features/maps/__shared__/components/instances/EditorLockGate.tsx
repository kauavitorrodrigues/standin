import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EditorAcquiringState } from "@/features/maps/__shared__/components/views/EditorAcquiringState";
import { EditorLockDeniedState } from "@/features/maps/__shared__/components/views/EditorLockDeniedState";
import { LOCK_STATUS } from "@/features/maps/__shared__/consts/lock-status";
import { EditorLockContext } from "@/features/maps/__shared__/contexts/EditorLockContext";
import { useEditorLock } from "@/features/maps/__shared__/hooks/useEditorLock";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { useLockStatusSync } from "@/features/maps/__shared__/hooks/useLockStatusSync";
import { clearEditorQueries } from "@/features/maps/__shared__/utils/clearEditorQueries";

type EditorLockGateProps = {
    mapId: string;
    onExit: () => void;
    children: ReactNode;
};

// The editor opens only after the lock is granted (spec 8.1): the map and the
// palette load below this gate. A lost lock keeps the editor mounted, blocked,
// so the draft is not thrown away while it is got back.
export const EditorLockGate = ({
    mapId,
    onExit,
    children,
}: EditorLockGateProps) => {
    const store = useEditorStore();
    const queryClient = useQueryClient();
    const { lock, control } = useEditorLock(mapId, store.sessionId, () =>
        clearEditorQueries(queryClient, mapId)
    );
    useLockStatusSync(lock.status);

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
