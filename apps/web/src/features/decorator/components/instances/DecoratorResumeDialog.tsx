import { ResumeDialog } from "@/features/decorator/components/dialogs/ResumeDialog";
import type { DecorationResume } from "@/features/decorator/types/decoration-resume";

type DecoratorResumeDialogProps = {
    resume: DecorationResume;
    onResume: () => void;
    onDiscard: () => void;
};

// Offers the saved decoration once the base model is ready. The decision comes
// from the workspace, which also holds the persistence back until it is made.
export const DecoratorResumeDialog = ({
    resume,
    onResume,
    onDiscard,
}: DecoratorResumeDialogProps) => {
    if (resume.kind !== "offer") return null;

    return (
        <ResumeDialog
            paused={resume.paused}
            changed={resume.changed}
            onResume={onResume}
            onDiscard={onDiscard}
        />
    );
};
