import type { OnboardingResponse, OnboardingTaskKey } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const putTask = async (
    key: OnboardingTaskKey
): Promise<OnboardingResponse> => {
    const res = await api.put(`/onboarding/tasks/${key}`);
    return res.data;
};
