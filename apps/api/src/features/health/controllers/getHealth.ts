import type { Request, Response } from "express";
import { HealthService } from "@standin/core";
import { HEALTH_CACHE_CONTROL } from "@/consts/health";
import { sendError } from "@/utils/sendError";
import { getHealthHttpStatus } from "../utils/getHealthHttpStatus";

export const getHealth = async (_req: Request, res: Response) => {
    // A probe must never be answered from a cache, whatever the answer is.
    res.set("Cache-Control", HEALTH_CACHE_CONTROL);

    try {
        const report = await HealthService.getPublic();
        res.status(getHealthHttpStatus(report.status)).json(report);
    } catch (error) {
        // The check itself does not throw, so this is a bug. The answer stays
        // generic.
        return sendError({
            res,
            code: 500,
            reportError: error,
            message: "Health check failed",
        });
    }
};
