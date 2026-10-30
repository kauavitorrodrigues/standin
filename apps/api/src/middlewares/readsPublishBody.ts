import express from "express";
import type { NextFunction, Response } from "express";
import {
    MAX_PUBLISH_BODY_BYTES,
    PublishTooManyOpsError,
} from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { sendError } from "@/utils/sendError";

const readJson = express.json({ limit: MAX_PUBLISH_BODY_BYTES });

// Reads the JSON body of the publish and apply routes with their own limit,
// so the global reader keeps its small one for every other route (app.ts
// skips these routes).
// A body over the limit answers 413 OP_TOO_LARGE like too many operations.
export const ReadsPublishBody = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    readJson(req, res, (error?: unknown) => {
        if (!error) return next();

        const tooLarge =
            typeof error === "object" &&
            error !== null &&
            "type" in error &&
            error.type === "entity.too.large";
        if (tooLarge) {
            return sendError({
                res,
                reportError: new PublishTooManyOpsError(),
            });
        }

        return sendError({ res, code: 400, reportError: error });
    });
};
