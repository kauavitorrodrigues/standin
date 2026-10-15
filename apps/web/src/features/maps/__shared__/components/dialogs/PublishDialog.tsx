import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { PUBLISH_DIALOG_MODE } from "@/features/editor/consts/publish";
import { PublishConfirmBody } from "@/features/editor/components/views/publish/PublishConfirmBody";
import { PublishFailedBody } from "@/features/editor/components/views/publish/PublishFailedBody";
import { PublishIssuesBody } from "@/features/editor/components/views/publish/PublishIssuesBody";
import { PublishProgressBody } from "@/features/editor/components/views/publish/PublishProgressBody";
import { PublishStaleBody } from "@/features/editor/components/views/publish/PublishStaleBody";
import type { PublishDialogMode } from "@/features/maps/__shared__/types/publish-dialog-mode";
import type { PublishIssueRow } from "@/features/editor/types/publish-issue-row";

type PublishDialogProps = {
    open: boolean;
    mode: PublishDialogMode;
    opCount: number;
    nearLimit: boolean;
    issueRows: PublishIssueRow[];
    onClose: () => void;
    onConfirm: () => void;
    onFocusIssue: (row: PublishIssueRow) => void;
    onReload: () => void;
};

const renderBody = ({
    mode,
    opCount,
    nearLimit,
    issueRows,
    onConfirm,
    onFocusIssue,
    onReload,
}: PublishDialogProps) => {
    switch (mode) {
        case PUBLISH_DIALOG_MODE.CONFIRM:
            return (
                <PublishConfirmBody
                    opCount={opCount}
                    nearLimit={nearLimit}
                    onConfirm={onConfirm}
                />
            );
        case PUBLISH_DIALOG_MODE.PUBLISHING:
            return <PublishProgressBody />;
        case PUBLISH_DIALOG_MODE.VALIDATION:
            return (
                <PublishIssuesBody rows={issueRows} onFocus={onFocusIssue} />
            );
        case PUBLISH_DIALOG_MODE.STALE:
            return <PublishStaleBody onReload={onReload} />;
        case PUBLISH_DIALOG_MODE.FAILED:
            return <PublishFailedBody onRetry={onConfirm} />;
    }
};

// The dialog that publishes the draft: the confirmation, the progress and each way
// the publish can fail. It only draws what it is given.
export const PublishDialog = (props: PublishDialogProps) => {
    const handleOpenChange = (next: boolean) => {
        if (next) return;
        if (props.mode === PUBLISH_DIALOG_MODE.PUBLISHING) return;
        props.onClose();
    };

    return (
        <AlertDialog open={props.open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="sm:max-w-lg">
                {renderBody(props)}
            </AlertDialogContent>
        </AlertDialog>
    );
};
