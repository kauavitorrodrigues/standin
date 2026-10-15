import { EDIT_SCOPES } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { DECORATOR_MESSAGES } from "@/features/decorator/consts/messages";
import { DiscardDialog } from "@/features/editor/components/dialogs/DiscardDialog";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { useDiscardDraft } from "@/features/maps/__shared__/hooks/useDiscardDraft";

// "Descartar alterações" of the menu: throws away what was decorated since the
// decorator opened, and the saved copy with it. The decorator stays open.
export const DecoratorDiscardDialog = () => {
    const store = useEditorStore();
    const discardDraft = useDiscardDraft(EDIT_SCOPES.OBJECTS);
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
        toast.add({ title: DECORATOR_MESSAGES.DISCARDED, type: "success" });
    };

    return (
        <DiscardDialog
            open={open}
            onOpenChange={handleOpenChange}
            onConfirm={handleConfirm}
        />
    );
};
