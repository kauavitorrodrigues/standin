import type { Response } from "express";
import { z, type ZodError } from "zod/v4";
import { ErrorMessages } from "@/enums/errorMessages";

type SendErrorOptions = {
    res: Response;
    error?: ZodError;
    reportError?: unknown;
    code?: number;
    message?: string;
};

export const sendError = ({
    res,
    error,
    reportError,
    code = 400,
    message,
}: SendErrorOptions) => {
    if (reportError) console.error(reportError);
    if (error) return res.status(code).json(z.flattenError(error));
    return res.status(code).json({ error: message ?? ErrorMessages.SERVER_ERROR });
};

export const sendUnauthorizedError = (res: Response) => {
    return sendError({ res, code: 401, message: ErrorMessages.UNAUTHORIZED });
};
