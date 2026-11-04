import { ONBOARDING_TASK_ORDER } from "../../consts/tasks";
import { useChecklistLauncher } from "../../hooks/useChecklistLauncher";
import { LauncherButton } from "../views/launcher/LauncherButton";

// The button above the camera buttons. It leaves the bar once every task is done.
export const OnboardingLauncher = () => {
    const { isVisible, doneCount, toggle } = useChecklistLauncher();
    if (!isVisible) return null;

    return (
        <LauncherButton
            doneCount={doneCount}
            total={ONBOARDING_TASK_ORDER.length}
            onClick={toggle}
        />
    );
};
