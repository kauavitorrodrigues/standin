import type { Cell, PublishResult } from "@standin/contracts";
import { EditorDeskRemovalDialog } from "@/features/maps/__shared__/components/instances/EditorDeskRemovalDialog";
import { EditorDiscardDialog } from "@/features/maps/__shared__/components/instances/EditorDiscardDialog";
import { EditorExitDialog } from "@/features/maps/__shared__/components/instances/EditorExitDialog";
import { EditorPublishDialog } from "@/features/maps/__shared__/components/instances/EditorPublishDialog";
import { EditorResumeDialog } from "@/features/maps/__shared__/components/instances/EditorResumeDialog";
import type { ResumeDraft } from "@/features/maps/__shared__/types/ResumeDraft";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useUnsavedChangesGuard } from "@/features/tilesets/hooks/useUnsavedChangesGuard";

type EditorDialogsProps = {
    resumeDraft: ResumeDraft;
    onExit: () => void;
    onFocusCell: (cell: Cell) => void;
    onPublished?: (result: PublishResult) => void;
};

// Every dialog of the editor, mounted once. The guard warns on closing the tab
// and on navigating away while the draft has changes.
export const EditorDialogs = ({
    resumeDraft,
    onExit,
    onFocusCell,
    onPublished,
}: EditorDialogsProps) => {
    const { hasChanges } = useEditorSelector((state) => state.draft);
    const guard = useUnsavedChangesGuard(hasChanges);

    // After a publish that was asked to leave. A navigation the guard stopped
    // goes where it was heading.
    const leaveAfterPublish = () => {
        if (guard.blocked) {
            guard.leave();
            return;
        }
        guard.release();
        onExit();
    };

    return (
        <>
            <EditorResumeDialog
                decision={resumeDraft.decision}
                onResume={resumeDraft.resume}
                onDiscard={resumeDraft.discard}
            />
            <EditorDeskRemovalDialog />
            <EditorDiscardDialog />
            <EditorExitDialog onExit={onExit} guard={guard} />
            <EditorPublishDialog
                onLeave={leaveAfterPublish}
                onFocusCell={onFocusCell}
                onPublished={onPublished}
            />
        </>
    );
};
