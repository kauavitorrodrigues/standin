import { ONBOARDING_MESSAGES } from "../consts/messages";
import type { OnboardingTaskCopy } from "../types/taskCopy";

type TaskText = { title: string; description: string };

// The text of a task changes once it is done.
export function taskText(copy: OnboardingTaskCopy, isDone: boolean): TaskText {
    if (isDone) {
        return { title: copy.doneTitle, description: copy.doneDescription };
    }
    return { title: copy.title, description: copy.description };
}

// A task with an action in the space names it; one without only says it was
// understood.
export function primaryLabelOf(
    copy: OnboardingTaskCopy,
    hasAction: boolean
): string {
    if (hasAction) return copy.actionLabel;
    return ONBOARDING_MESSAGES.UNDERSTOOD;
}
