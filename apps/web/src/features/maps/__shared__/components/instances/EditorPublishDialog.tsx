import { useMemo } from "react";
import type { Cell, PublishResult } from "@standin/contracts";
import { PublishDialog } from "@/features/maps/__shared__/components/dialogs/PublishDialog";
import { EDITOR_DIALOG } from "@/features/maps/__shared__/consts/editor-dialog";
import { PUBLISH_ERROR_KIND } from "@/features/maps/__shared__/consts/publish";
import { useDraftSelector } from "@/features/maps/__shared__/hooks/useDraftSelector";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { usePublishDraft } from "@/features/maps/__shared__/hooks/usePublishDraft";
import { useReloadMap } from "@/features/maps/__shared__/hooks/useReloadMap";
import type { PublishIssueRow } from "@/features/maps/__shared__/types/publish-issue-row";
import { getPublishDialogMode } from "@/features/maps/__shared__/utils/getPublishDialogMode";
import { getPublishIssueRows } from "@/features/maps/__shared__/utils/getPublishIssueRows";
import { isNearPublishLimit } from "@/features/maps/__shared__/utils/isNearPublishLimit";

type EditorPublishDialogProps = {
    // Leaves the editor, after a publish that was asked to leave.
    onLeave: () => void;
    onFocusCell: (cell: Cell) => void;
    onPublished?: (result: PublishResult) => void;
};

// Connects the publish dialog to the stores: the phase of the publish and what
// each button does.
export const EditorPublishDialog = ({
    onLeave,
    onFocusCell,
    onPublished,
}: EditorPublishDialogProps) => {
    const store = useEditorStore();
    const publish = usePublishDraft({ onPublished, onLeave });
    const reload = useReloadMap();
    const ops = useDraftSelector((state) => state.ops);
    const base = useDraftSelector((state) => state.base);
    const open = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.PUBLISH
    );
    const phase = useEditorSelector((state) => state.publishPhase);
    const failure = useEditorSelector((state) => state.publishFailure);

    const issueRows = useMemo(
        () =>
            failure?.kind === PUBLISH_ERROR_KIND.VALIDATION
                ? getPublishIssueRows(failure.issues, ops, base)
                : [],
        [failure, ops, base]
    );

    const handleFocusIssue = (row: PublishIssueRow) => {
        store.hidePublish();
        if (row.cell) onFocusCell(row.cell);
    };

    return (
        <PublishDialog
            open={open}
            mode={getPublishDialogMode(phase, failure)}
            opCount={ops.length}
            nearLimit={isNearPublishLimit(ops.length)}
            issueRows={issueRows}
            onClose={store.dismissPublish}
            onConfirm={publish}
            onFocusIssue={handleFocusIssue}
            onReload={reload}
        />
    );
};
