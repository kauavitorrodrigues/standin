import { ExitDialog } from "@/features/maps/__shared__/components/dialogs/ExitDialog";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useDiscardDraft } from "@/features/maps/__shared__/hooks/useDiscardDraft";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { UnsavedChangesGuard } from "@/features/maps/__shared__/types/UnsavedChangesGuard";
import { createExitChoices } from "@/features/maps/__shared__/utils/createExitChoices";

type EditorExitDialogProps = {
    onExit: () => void;
    guard: UnsavedChangesGuard;
};

// Leaving with changes: from the back button, or from a navigation the router
// stopped (the guard), which also ends up here.
export const EditorExitDialog = ({ onExit, guard }: EditorExitDialogProps) => {
    const store = useEditorStore();
    const discardDraft = useDiscardDraft();
    const asked = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.EXIT
    );
    // The publish dialog takes over while it publishes and leaves.
    const publishing = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.PUBLISH
    );

    const locked = useEditorSelector((state) => state.locked);

    const choices = createExitChoices({
        discard: discardDraft,
        publishAndExit: store.publishAndExit,
        onExit,
        close: store.closeDialog,
        blocked: guard.blocked,
        proceedBlocked: guard.leave,
        stayBlocked: guard.stay,
        release: guard.release,
    });

    return (
        <ExitDialog
            open={(asked || guard.blocked) && !publishing}
            publishDisabled={locked}
            onPublishAndExit={choices.publishAndLeave}
            onKeepAndExit={choices.keepAndLeave}
            onDiscardAndExit={choices.discardAndLeave}
            onKeepEditing={choices.keepEditing}
        />
    );
};
