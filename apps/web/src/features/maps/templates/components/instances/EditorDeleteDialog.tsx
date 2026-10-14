import type { MapTemplate } from "@standin/contracts";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useRunWithoutLock } from "@/features/maps/__shared__/hooks/useRunWithoutLock";
import { DeleteTemplateDialog } from "../dialogs/DeleteDialog";

type Props = {
    template: Pick<MapTemplate, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
};

// The delete confirmation of the editor of a template. The server refuses to
// delete a locked map, so the lock (and the draft) go first.
export const EditorDeleteDialog = ({
    template,
    open,
    onOpenChange,
    onDeleted,
}: Props) => {
    const runWithoutLock = useRunWithoutLock();
    const hasChanges = useEditorSelector((state) => state.draft.hasChanges);

    return (
        <DeleteTemplateDialog
            template={template}
            open={open}
            onOpenChange={onOpenChange}
            onDeleted={onDeleted}
            hasUnpublishedChanges={hasChanges}
            run={runWithoutLock}
        />
    );
};
