import type { Response } from "express";
import { OnboardingService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const getOnboarding = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const onboarding = await OnboardingService.get(req.user.id);
        res.status(200).json(onboarding);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
