import { queryOptions, useQuery } from "@tanstack/react-query";
import type { OnboardingResponse } from "@standin/contracts";
import { useQueryUtils } from "@/lib/tanstack/useQueryUtils";
import { ONBOARDING_QUERY_KEY } from "../consts/queryKeys";
import { fetchProgress } from "../lib/fetchProgress";

export const progressQueryOptions = () =>
    queryOptions({
        queryKey: [ONBOARDING_QUERY_KEY],
        queryFn: fetchProgress,
    });

export const useProgress = () => {
    const query = useQuery(progressQueryOptions());
    return { ...query, progress: query.data?.tasks };
};

export const useProgressQueryUtils = () =>
    useQueryUtils<OnboardingResponse>([ONBOARDING_QUERY_KEY]);
