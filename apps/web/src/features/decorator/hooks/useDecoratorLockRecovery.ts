import { useCallback, useState } from "react";
import { toast } from "@/components/ui/toast";
import { DECORATOR_MESSAGES } from "@/features/decorator/consts/messages";
import { useReplayDecoration } from "@/features/decorator/hooks/useReplayDecoration";
import { getPublishedObjectsRevision } from "@/features/decorator/utils/getPublishedObjectsRevision";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useLockControl } from "@/features/maps/__shared__/hooks/useLockControl";

// The "Recuperar" of the notice over the panel. It asks for the lock again.
// When the lock is ours, and the objects of the space are the ones the draft
// started from, the decorator goes on as it was. When they changed, the draft
// is replayed on the new state first. When the lock is still held by the owner
// (the Studio is open) nothing changes, and the notice stays.
export const useDecoratorLockRecovery = () => {
    const control = useLockControl();
    const draftStore = useDraftStore();
    const replay = useReplayDecoration();
    const [isRecovering, setIsRecovering] = useState(false);

    const recover = useCallback(async () => {
        setIsRecovering(true);
        try {
            const ack = await control.reacquire();
            if (!ack?.ok) {
                toast.add({
                    title: DECORATOR_MESSAGES.LOCK_RECOVERY_FAILED,
                    type: "error",
                });
                return;
            }

            const { mapId, objectsRevision } = draftStore.getState().base;
            const revision = await getPublishedObjectsRevision(mapId);
            const changed =
                revision !== null && revision !== (objectsRevision ?? null);
            if (changed && !(await replay())) {
                void control.release();
                return;
            }

            control.restore();
            toast.add({
                title: DECORATOR_MESSAGES.LOCK_RESUMED,
                type: "success",
            });
        } finally {
            setIsRecovering(false);
        }
    }, [control, draftStore, replay]);

    return { recover, isRecovering };
};
