import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { getEditorStatus } from "@/features/maps/__shared__/utils/getEditorStatus";
import { StatusBadge } from "@/features/maps/__shared__/components/views/status/StatusBadge";

// The lock status is the real one, fed by the lock hook. "Tentar de novo"
// opens the publish dialog on the failure, where the retry lives.
export const EditorStatusBadge = () => {
    const store = useEditorStore();
    const hasChanges = useEditorSelector((state) => state.draft.hasChanges);
    const publishPhase = useEditorSelector((state) => state.publishPhase);
    const lockStatus = useEditorSelector((state) => state.lockStatus);

    const status = getEditorStatus({
        hasChanges,
        publishPhase,
        lockStatus,
    });

    return <StatusBadge status={status} onRetry={store.reopenPublish} />;
};
