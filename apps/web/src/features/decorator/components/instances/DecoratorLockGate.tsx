import type { ReactNode } from "react";
import { EDIT_SCOPES } from "@standin/contracts";
import { PanelNotice } from "@/features/decorator/components/views/PanelNotice";
import { PanelOpening } from "@/features/decorator/components/views/PanelOpening";
import { LockLostReasonContext } from "@/features/decorator/contexts/LockLostReasonContext";
import { getDeniedDescription } from "@/features/decorator/utils/getDeniedDescription";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { EditorLockContext } from "@/features/maps/__shared__/contexts/EditorLockContext";
import { useEditorLock } from "@/features/maps/__shared__/hooks/useEditorLock";
import { useLockStatusSync } from "@/features/maps/__shared__/hooks/useLockStatusSync";
import { usePauseDraftOnTakeover } from "@/features/maps/__shared__/hooks/usePauseDraftOnTakeover";

type DecoratorLockGateProps = {
    mapId: string;
    onClose: () => void;
    children: ReactNode;
};

// The decorator opens only after the lock of the objects is granted, so two
// people never decorate the same space. Someone else decorating, or the owner
// in the Studio, shows why in the panel. A lost lock keeps the decorator
// mounted, read only, so the draft is not thrown away while it is got back.
// When the Studio is what took the lock, the saved draft is marked as paused.
export const DecoratorLockGate = ({
    mapId,
    onClose,
    children,
}: DecoratorLockGateProps) => {
    const store = useEditorStore();
    const { lock, control, lostReason } = useEditorLock(
        mapId,
        store.sessionId,
        undefined,
        EDIT_SCOPES.OBJECTS
    );
    useLockStatusSync(lock.status);
    usePauseDraftOnTakeover(mapId, EDIT_SCOPES.OBJECTS, lostReason);

    switch (lock.status) {
        case LOCK_STATUS.ACQUIRING:
            return <PanelOpening />;
        case LOCK_STATUS.DENIED:
            return (
                <PanelNotice
                    title="Não foi possível abrir o decorator"
                    message={getDeniedDescription(lock)}
                    onClose={onClose}
                />
            );
        case LOCK_STATUS.HELD:
        case LOCK_STATUS.LOST:
            return (
                <EditorLockContext.Provider value={control}>
                    <LockLostReasonContext.Provider value={lostReason}>
                        {children}
                    </LockLostReasonContext.Provider>
                </EditorLockContext.Provider>
            );
    }
};
