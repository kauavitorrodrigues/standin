import type { OnboardingTaskActions } from "../../types/actions";
import { ChecklistPanel } from "./ChecklistPanel";
import { TaskFlowDialog } from "./TaskFlowDialog";

// The cards of the flow that is on screen: the checklist or one task.
export const OnboardingPanels = ({
    actions,
}: {
    actions?: OnboardingTaskActions;
}) => (
    <>
        <ChecklistPanel />
        <TaskFlowDialog actions={actions} />
    </>
);
