import { DiscardDialog } from "@/features/editor/components/dialogs/DiscardDialog";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useDiscardDraft } from "@/features/maps/__shared__/hooks/useDiscardDraft";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";

export const EditorDiscardDialog = () => {
    const store = useEditorStore();
    const discardDraft = useDiscardDraft();
    const open = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.DISCARD
    );

    const handleOpenChange = (next: boolean) => {
        if (next) return;
        store.closeDialog();
    };

    const handleConfirm = async () => {
        store.closeDialog();
        await discardDraft();
    };

    return (
        <DiscardDialog
            open={open}
            onOpenChange={handleOpenChange}
            onConfirm={handleConfirm}
        />
    );
};
