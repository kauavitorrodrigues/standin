import { ListChecksIcon } from "lucide-react";
import { CircleProgress } from "@/components/ui/circle-progress";
import { FloatingIconButton } from "@/components/FloatingIconButton";
import { ONBOARDING_MESSAGES } from "../../../consts/messages";

type Props = {
    doneCount: number;
    total: number;
    onClick: () => void;
};

// A small button with a ring of the progress, made to sit in the column of
// the camera buttons.
export const LauncherButton = ({ doneCount, total, onClick }: Props) => (
    <FloatingIconButton
        icon={
            <CircleProgress
                value={(doneCount / total) * 100}
                className="size-6"
                aria-label={ONBOARDING_MESSAGES.CHECKLIST_PROGRESS_LABEL}
            >
                <ListChecksIcon className="size-3" />
            </CircleProgress>
        }
        label={`${ONBOARDING_MESSAGES.CHECKLIST_TITLE}, ${doneCount} de ${total}`}
        onClick={onClick}
        className="size-8 rounded-lg bg-muted text-foreground ring-1 ring-foreground/10 hover:bg-accent hover:text-foreground"
    />
);
