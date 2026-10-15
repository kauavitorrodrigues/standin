import { ResumeDraftDialog } from "@/features/maps/__shared__/components/dialogs/ResumeDraftDialog";
import { RESUME_DECISION } from "@/features/maps/__shared__/consts/resume-decision";
import type { ResumeDecision } from "@/features/maps/__shared__/types/ResumeDecision";

type EditorResumeDialogProps = {
    decision: ResumeDecision;
    onResume: () => void;
    onDiscard: () => void;
};

// Offers the saved draft once the base model is ready. The decision comes
// from the workspace, which also holds the persistence back until it is made.
export const EditorResumeDialog = ({
    decision,
    onResume,
    onDiscard,
}: EditorResumeDialogProps) => (
    <ResumeDraftDialog
        open={decision.kind !== RESUME_DECISION.NONE}
        stale={decision.kind === RESUME_DECISION.STALE}
        onResume={onResume}
        onDiscard={onDiscard}
    />
);
