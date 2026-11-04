import { useCallback } from "react";
import type { OnboardingTaskKey } from "@standin/contracts";
import { OnboardingMutations } from "../mutations";
import { OnboardingQueries } from "../queries";
import { isTaskDone } from "../utils/progress";

// Tasks with a call in flight, shared by every caller so two places that
// notice the same thing at once still send one request.
const sending = new Set<OnboardingTaskKey>();

// Marks a task done. A task that is already done, or already being sent, makes
// no call. A failure is silent: onboarding never gets in the way.
export function useCompleteTask() {
    const progressUtils = OnboardingQueries.useProgressUtils();
    const { mutate } = OnboardingMutations.markTask();

    return useCallback(
        (key: OnboardingTaskKey) => {
            if (sending.has(key)) return;
            if (isTaskDone(progressUtils.getData()?.tasks, key)) return;

            sending.add(key);
            mutate(key, { onSettled: () => sending.delete(key) });
        },
        // The utils object is new on every render; what it reads is the cache.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [mutate]
    );
}
