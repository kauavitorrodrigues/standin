import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ONBOARDING_FLOW_KINDS } from "../consts/flow";
import {
    readChecklistPreferences,
    writeChecklistPreferences,
} from "../lib/checklistPreferences";
import { ONBOARDING_MESSAGES } from "../consts/messages";
import { OnboardingQueries } from "../queries";
import { areAllTasksDone, countDoneTasks } from "../utils/progress";
import { useOnboardingFlow } from "./useOnboardingFlow";

// Opens the checklist by itself the first time, congratulates once when the
// last task is done, and tells the button what to show.
export function useChecklistLauncher() {
    const { user } = useAuth();
    const { progress } = OnboardingQueries.useProgress();
    const flow = useOnboardingFlow();

    const isLoaded = progress !== undefined;
    const doneCount = countDoneTasks(progress);
    const isComplete = areAllTasksDone(progress);

    useEffect(() => {
        if (!isLoaded || doneCount > 0) return;
        if (readChecklistPreferences(user.id).autoOpened) return;
        writeChecklistPreferences(user.id, { autoOpened: true });
        flow.open({ kind: ONBOARDING_FLOW_KINDS.CHECKLIST });
        // The flow object changes with the open card; opening once is enough.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, doneCount, user.id]);

    useEffect(() => {
        if (!isComplete) return;
        if (readChecklistPreferences(user.id).celebrated) return;
        writeChecklistPreferences(user.id, { celebrated: true });
        toast.add({
            title: ONBOARDING_MESSAGES.ALL_DONE_TITLE,
            description: ONBOARDING_MESSAGES.ALL_DONE_DESCRIPTION,
        });
    }, [isComplete, user.id]);

    return {
        // Nothing to show until the progress is known, and nothing once done.
        isVisible: isLoaded && !isComplete,
        doneCount,
        isOpen: flow.isActive(ONBOARDING_FLOW_KINDS.CHECKLIST),
        toggle: () => {
            if (flow.isActive(ONBOARDING_FLOW_KINDS.CHECKLIST)) {
                flow.close();
                return;
            }
            flow.open({ kind: ONBOARDING_FLOW_KINDS.CHECKLIST });
        },
    };
}
