import { usePresence } from "@/hooks/usePresence";
import { FLOATING_CARD_EXIT_MS } from "@/features/spaces/consts/floatingCard";
import { ONBOARDING_FLOW_KINDS } from "../../consts/flow";
import { ONBOARDING_TASK_COPY } from "../../consts/taskCopy";
import { ONBOARDING_TASK_ORDER } from "../../consts/tasks";
import { useOnboardingFlow } from "../../hooks/useOnboardingFlow";
import { OnboardingQueries } from "../../queries";
import type { ChecklistItem } from "../../types/checklist";
import { countDoneTasks, isTaskDone } from "../../utils/progress";
import { taskText } from "../../utils/taskText";
import { ChecklistCard } from "../views/checklist/ChecklistCard";

export const ChecklistPanel = () => {
    const flow = useOnboardingFlow();
    const { progress } = OnboardingQueries.useProgress();
    const isOpen = flow.isActive(ONBOARDING_FLOW_KINDS.CHECKLIST);
    const { isMounted } = usePresence(isOpen, FLOATING_CARD_EXIT_MS);
    if (!isMounted) return null;

    const items: ChecklistItem[] = ONBOARDING_TASK_ORDER.map((taskKey) => {
        const isDone = isTaskDone(progress, taskKey);
        const { title } = taskText(ONBOARDING_TASK_COPY[taskKey], isDone);
        return { taskKey, title, isDone };
    });

    // Stays mounted while it fades away, then leaves the stack.
    return (
        <ChecklistCard
            isOpen={isOpen}
            items={items}
            doneCount={countDoneTasks(progress)}
            onSelect={(taskKey) =>
                flow.open({ kind: ONBOARDING_FLOW_KINDS.TASK, taskKey })
            }
            onClose={flow.close}
        />
    );
};
