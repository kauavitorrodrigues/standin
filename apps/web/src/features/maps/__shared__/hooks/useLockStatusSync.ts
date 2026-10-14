import { useEffect } from "react";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import type { LockStatus } from "@/features/maps/__shared__/types/lock-status";

// Tells the EditorStore where the lock stands, so the tools, the keys, the
// publish and the status badge follow it.
export const useLockStatusSync = (status: LockStatus["status"]) => {
    const store = useEditorStore();

    useEffect(() => {
        store.setLockStatus(status);
    }, [store, status]);
};
