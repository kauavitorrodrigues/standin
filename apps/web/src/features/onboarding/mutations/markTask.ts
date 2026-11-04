import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OnboardingTaskKey } from "@standin/contracts";
import { ONBOARDING_QUERY_KEY } from "../consts/queryKeys";
import { putTask } from "../lib/putTask";
import { OnboardingQueries } from "../queries";
import { withTaskDone } from "../utils/progress";

export const useMarkTask = () => {
    const queryClient = useQueryClient();
    const progressUtils = OnboardingQueries.useProgressUtils();

    return useMutation({
        mutationFn: (key: OnboardingTaskKey) => putTask(key),
        // The checklist ticks at once; the answer of the server replaces it.
        onMutate: async (key) => {
            // A read still on its way must not overwrite the tick.
            await queryClient.cancelQueries({
                queryKey: [ONBOARDING_QUERY_KEY],
            });
            const previous = progressUtils.getData();
            progressUtils.setData({
                tasks: withTaskDone(
                    previous?.tasks,
                    key,
                    new Date().toISOString()
                ),
            });
            return { previous };
        },
        onError: (_error, _key, context) => {
            if (!context?.previous) return progressUtils.invalidate();
            progressUtils.setData(context.previous);
        },
        onSuccess: (data) => progressUtils.setData(data),
    });
};
