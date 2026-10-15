import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { DECORATOR_FAILURE_MODES } from "@/features/decorator/consts/failure-modes";
import type { DecoratorFailureMode } from "@/features/decorator/types/failure-mode";
import { GenericBody } from "@/features/decorator/components/views/failure/GenericBody";
import { NetworkBody } from "@/features/decorator/components/views/failure/NetworkBody";
import { StaleBody } from "@/features/decorator/components/views/failure/StaleBody";
import { ValidationBody } from "@/features/decorator/components/views/failure/ValidationBody";
import type { PublishIssueRow } from "@/features/editor/types/publish-issue-row";

type FailureDialogProps = {
    mode: DecoratorFailureMode;
    issueRows: PublishIssueRow[];
    isReplaying: boolean;
    onClose: () => void;
    onRetry: () => void;
    onReplay: () => void;
    onDiscard: () => void;
    onFocusIssue: (row: PublishIssueRow) => void;
};

const renderBody = ({
    mode,
    issueRows,
    isReplaying,
    onRetry,
    onReplay,
    onDiscard,
    onFocusIssue,
}: FailureDialogProps) => {
    switch (mode) {
        case DECORATOR_FAILURE_MODES.VALIDATION:
            return (
                <ValidationBody
                    rows={issueRows}
                    onFocus={onFocusIssue}
                    onDiscard={onDiscard}
                />
            );
        case DECORATOR_FAILURE_MODES.STALE:
            return (
                <StaleBody
                    isReplaying={isReplaying}
                    onReplay={onReplay}
                    onDiscard={onDiscard}
                />
            );
        case DECORATOR_FAILURE_MODES.NETWORK:
            return <NetworkBody onRetry={onRetry} />;
        case DECORATOR_FAILURE_MODES.FAILED:
            return <GenericBody onRetry={onRetry} />;
    }
};

// Every way an apply can fail. The decorator stays open under it and the draft
// is kept, so closing the dialog goes back to decorating.
export const FailureDialog = (props: FailureDialogProps) => {
    const handleOpenChange = (next: boolean) => {
        if (next) return;
        props.onClose();
    };

    return (
        <AlertDialog open onOpenChange={handleOpenChange}>
            <AlertDialogContent className="sm:max-w-lg">
                {renderBody(props)}
            </AlertDialogContent>
        </AlertDialog>
    );
};
