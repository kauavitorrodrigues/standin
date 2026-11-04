import type { OnboardingResponse } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const fetchProgress = async (): Promise<OnboardingResponse> => {
    const res = await api.get("/onboarding");
    return res.data;
};
