import type { NextFunction, Response } from "express";
import type { ExtendedRequest } from "@/types/request";
import { sendUnauthorizedError } from "@/utils/sendError";
import { authenticateFromRequest } from "@/features/auth/services/authenticateFromRequest";

export const RequiresAuth = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
) => {
    const user = await authenticateFromRequest(req);
    if (!user) return sendUnauthorizedError(res);
    req.user = user;
    next();
};
