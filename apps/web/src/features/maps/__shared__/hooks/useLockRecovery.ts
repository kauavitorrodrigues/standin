import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import {
    LOCK_GIVE_UP_REASON,
    LOCK_RECOVERY,
    LOCK_RECOVERY_DELAYS_MS,
} from "@/features/maps/__shared__/consts/lock-recovery";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { EDITOR_MESSAGES } from "@/features/editor/consts/messages";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { useLockControl } from "@/features/maps/__shared__/hooks/useLockControl";
import { getLockRecovery } from "@/features/maps/__shared__/utils/getLockRecovery";
import { getLockRecoveryDelay } from "@/features/maps/__shared__/utils/getLockRecoveryDelay";
import { isPublishLockLost } from "@/features/maps/__shared__/utils/isPublishLockLost";
import { getPublishedVersion } from "@/features/maps/__shared__/utils/getPublishedVersion";
import { wait } from "@/features/maps/__shared__/utils/wait";

// A lost lock (heartbeat refused, `editor:lock_lost`, or a 423 on publish)
// blocks the editor. This hook then tries to get the lock back, waiting a bit
// longer between tries. It resumes only when the lock is ours again AND the
// published version is still the one the draft started from. Otherwise it
// stops and the editor stays blocked, with the draft kept in IndexedDB: the
// user can only leave or discard. Mounted below the DraftStoreProvider,
// because the version of the draft is read from it.
export const useLockRecovery = () => {
    const control = useLockControl();
    const editorStore = useEditorStore();
    const draftStore = useDraftStore();
    const lockStatus = useEditorSelector((state) => state.lockStatus);
    const publishLostLock = useEditorSelector((state) =>
        isPublishLockLost(state.publishFailure)
    );

    useEffect(() => {
        if (publishLostLock) control.markLost();
    }, [publishLostLock, control]);

    useEffect(() => {
        if (lockStatus !== LOCK_STATUS.LOST) return;
        let cancelled = false;

        const giveUp = () => {
            toast.add({
                title: EDITOR_MESSAGES.LOCK_RECOVERY_FAILED,
                type: "error",
            });
        };

        const recover = async () => {
            const { mapId } = draftStore.getState().base;

            const attempts = LOCK_RECOVERY_DELAYS_MS.length;

            for (let attempt = 1; attempt <= attempts; attempt++) {
                await wait(getLockRecoveryDelay(attempt));
                if (cancelled) return;

                const ack = await control.reacquire();
                if (cancelled) return;

                const publishedVersion = ack?.ok
                    ? await getPublishedVersion(mapId)
                    : null;
                if (cancelled) return;

                const recovery = getLockRecovery({
                    ack,
                    publishedVersion,
                    baseVersion: draftStore.getState().base.version,
                });

                switch (recovery.kind) {
                    case LOCK_RECOVERY.RESUME:
                        if (
                            isPublishLockLost(
                                editorStore.getState().publishFailure
                            )
                        ) {
                            editorStore.resetPublish();
                        }
                        control.restore();
                        toast.add({
                            title: EDITOR_MESSAGES.LOCK_RESUMED,
                            type: "success",
                        });
                        return;
                    case LOCK_RECOVERY.GIVE_UP:
                        // The lock was granted but the draft cannot use it.
                        if (
                            recovery.reason ===
                            LOCK_GIVE_UP_REASON.VERSION_CHANGED
                        ) {
                            void control.release();
                        }
                        giveUp();
                        return;
                    case LOCK_RECOVERY.RETRY:
                        break;
                }
            }
            giveUp();
        };

        void recover();

        return () => {
            cancelled = true;
        };
    }, [lockStatus, control, draftStore, editorStore]);
};
