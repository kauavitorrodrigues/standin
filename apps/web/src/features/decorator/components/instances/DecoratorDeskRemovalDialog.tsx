import { summarizeObjectChanges } from "@standin/contracts";
import { OwnDeskRemovalDialog } from "@/features/decorator/components/dialogs/OwnDeskRemovalDialog";
import { describeDeskItems } from "@/features/decorator/utils/describeDeskItems";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { buildRemoveOps } from "@/features/editor/utils/buildRemoveOps";

// The warning before the own desk goes away. Delete, the bar over the object
// and every other way of removing a desk with an owner end here through the
// pending request of the store. Desks of other people never get here, because
// the decorator does not let them be touched.
const DeskRemovalWarning = ({ pending }: { pending: readonly string[] }) => {
    const store = useEditorStore();
    const { user } = useAuth();
    const model = useDraftSelector((state) => state.draft);

    const { ops } = buildRemoveOps({ model, ids: pending, releaseDesks: true });
    const summary = summarizeObjectChanges(model, ops, { userId: user.id });

    return (
        <OwnDeskRemovalDialog
            items={describeDeskItems(summary.ownDeskItems)}
            onConfirm={store.confirmDeskRemoval}
            onCancel={store.cancelDeskRemoval}
        />
    );
};

export const DecoratorDeskRemovalDialog = () => {
    const pending = useEditorSelector((state) => state.pendingDeskRemoval);

    if (pending.length === 0) return null;

    return <DeskRemovalWarning pending={pending} />;
};
