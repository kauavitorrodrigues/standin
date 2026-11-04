import { ONBOARDING_FLOW_KINDS } from "../../consts/flow";
import { ONBOARDING_TASK_COPY } from "../../consts/taskCopy";
import { useOnboardingFlow } from "../../hooks/useOnboardingFlow";
import { OnboardingQueries } from "../../queries";
import type { OnboardingTaskActions } from "../../types/actions";
import { isTaskDone } from "../../utils/progress";
import { primaryLabelOf, taskText } from "../../utils/taskText";
import { TaskDialog } from "../dialogs/TaskDialog";

type Props = {
    // What a task does in the space. A task without one only has "Entendi".
    actions?: OnboardingTaskActions;
};

// The dialog of the task that is on screen. The primary button closes it and
// then acts.
export const TaskFlowDialog = ({ actions }: Props) => {
    const flow = useOnboardingFlow();
    const { progress } = OnboardingQueries.useProgress();
    const active = flow.active;
    if (active?.kind !== ONBOARDING_FLOW_KINDS.TASK) return null;

    const copy = ONBOARDING_TASK_COPY[active.taskKey];
    const text = taskText(copy, isTaskDone(progress, active.taskKey));
    const action = actions?.[active.taskKey];

    const onPrimary = () => {
        flow.close();
        action?.();
    };

    // Dismissing a task goes back to the list, so the other steps stay in
    // view. Only the primary button leaves the list to act in the space.
    const backToChecklist = () =>
        flow.open({ kind: ONBOARDING_FLOW_KINDS.CHECKLIST });

    return (
        <TaskDialog
            title={text.title}
            description={text.description}
            imageSrc={copy.imageSrc}
            guideUrl={copy.guideUrl}
            primaryLabel={primaryLabelOf(copy, action !== undefined)}
            onPrimary={onPrimary}
            onClose={backToChecklist}
        />
    );
};
