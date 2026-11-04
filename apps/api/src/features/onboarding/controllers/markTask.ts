import type { Response } from "express";
import { OnboardingService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const markOnboardingTask = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;
        const params = parseSchema(paramsSchema("taskKey"), req.params, res);
        if (!params) return;

        // The service rejects a key that is not a task with a 400.
        const onboarding = await OnboardingService.markTask(
            req.user.id,
            params.taskKey
        );
        res.status(200).json(onboarding);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
