import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { UnsavedChangesGuard } from "@/features/maps/__shared__/types/UnsavedChangesGuard";
import { AreaDiscardDialog } from "../dialogs/AreaDiscardDialog";
import { AreaExitDialog } from "../dialogs/AreaExitDialog";

type Props = {
    guard: UnsavedChangesGuard;
    isSaving: boolean;
    onExit: () => void;
    onDiscard: () => void;
    onSaveAndExit: () => Promise<void>;
};

// The dialogs of the composer, mounted once. The exit one opens from the back
// button and also when the router stopped a navigation (the guard), which
// then goes where it was heading if the user leaves.
export const AreaDialogs = ({
    guard,
    isSaving,
    onExit,
    onDiscard,
    onSaveAndExit,
}: Props) => {
    const store = useEditorStore();
    const askedExit = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.EXIT
    );
    const askedDiscard = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.DISCARD
    );

    const keepEditing = () => {
        store.closeDialog();
        if (guard.blocked) guard.stay();
    };

    const exitWithoutSaving = () => {
        store.closeDialog();
        if (guard.blocked) {
            guard.leave();
            return;
        }
        guard.release();
        onExit();
    };

    const discard = () => {
        store.closeDialog();
        onDiscard();
    };

    return (
        <>
            <AreaDiscardDialog
                open={askedDiscard}
                onOpenChange={(next) => {
                    if (!next) store.closeDialog();
                }}
                onConfirm={discard}
            />
            <AreaExitDialog
                open={askedExit || guard.blocked}
                isSaving={isSaving}
                onSaveAndExit={() => {
                    store.closeDialog();
                    void onSaveAndExit();
                }}
                onExitWithoutSaving={exitWithoutSaving}
                onKeepEditing={keepEditing}
            />
        </>
    );
};
