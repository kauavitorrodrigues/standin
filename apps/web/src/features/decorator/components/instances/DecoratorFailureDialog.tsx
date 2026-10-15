import { useMemo, useState } from "react";
import { EDIT_SCOPES } from "@standin/contracts";
import type { Cell } from "@standin/contracts";
import { FailureDialog } from "@/features/decorator/components/dialogs/FailureDialog";
import { DECORATOR_FAILURE_MODES } from "@/features/decorator/consts/failure-modes";
import { useDecorationRetry } from "@/features/decorator/hooks/useDecorationRetry";
import { useReplayDecoration } from "@/features/decorator/hooks/useReplayDecoration";
import { getFailureMode } from "@/features/decorator/utils/getFailureMode";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { PublishIssueRow } from "@/features/editor/types/publish-issue-row";
import { useReloadMap } from "@/features/maps/__shared__/hooks/useReloadMap";
import { getPublishIssueRows } from "@/features/maps/__shared__/utils/getPublishIssueRows";

type DecoratorFailureDialogProps = {
    // Tries the apply again, with the same request.
    onRetry: () => Promise<boolean>;
    // Takes the view to a cell, for "Ir até lá".
    onFocusCell: (cell: Cell) => void;
};

// Connects the dialog of a failed apply to the stores. The apply itself runs
// in the workspace, so a retry repeats the same request. It stays out of the
// way until a failure that needs a decision is on the store.
export const DecoratorFailureDialog = ({
    onRetry,
    onFocusCell,
}: DecoratorFailureDialogProps) => {
    const store = useEditorStore();
    const replay = useReplayDecoration();
    const discard = useReloadMap(EDIT_SCOPES.OBJECTS);
    const [isReplaying, setIsReplaying] = useState(false);
    const ops = useDraftSelector((state) => state.ops);
    const base = useDraftSelector((state) => state.base);
    const open = useEditorSelector(
        (state) => state.dialog === EDITOR_DIALOG.PUBLISH
    );
    const phase = useEditorSelector((state) => state.publishPhase);
    const failure = useEditorSelector((state) => state.publishFailure);

    const mode = open ? getFailureMode(phase, failure) : null;

    const issueRows = useMemo(
        () =>
            failure?.kind === PUBLISH_ERROR_KIND.VALIDATION
                ? getPublishIssueRows(failure.issues, ops, base)
                : [],
        [failure, ops, base]
    );

    const retry = () => {
        void onRetry();
    };
    useDecorationRetry(mode === DECORATOR_FAILURE_MODES.NETWORK, retry);

    if (mode === null) return null;

    const handleReplay = async () => {
        setIsReplaying(true);
        await replay();
        setIsReplaying(false);
    };

    const handleFocusIssue = (row: PublishIssueRow) => {
        store.hidePublish();
        if (row.cell) onFocusCell(row.cell);
    };

    return (
        <FailureDialog
            mode={mode}
            issueRows={issueRows}
            isReplaying={isReplaying}
            onClose={store.dismissPublish}
            onRetry={retry}
            onReplay={handleReplay}
            onDiscard={discard}
            onFocusIssue={handleFocusIssue}
        />
    );
};
