import type { Response } from "express";
import { z, type ZodError } from "zod/v4";
import { BaseError } from "@standin/contracts";
import { ErrorMessages } from "@/enums/errorMessages";
import {
    ACTION_LABELS,
    RESOURCE_LABELS,
    type Action,
    type Resource,
} from "@/consts/resources";

type SendErrorOptions = {
    res: Response;
    error?: ZodError;
    reportError?: unknown;
    code?: number;
    resource?: Resource;
    action?: Action;
    plural?: boolean;
    message?: string;
};

export const buildErrorMessage = (
    resource: Resource,
    action: Action,
    plural = false
): string => {
    const labels = RESOURCE_LABELS[resource];
    const actionLabel = ACTION_LABELS[action];
    const resourceLabel = plural ? labels.plural : labels.singular;
    return `Erro ao ${actionLabel} ${resourceLabel}`;
};

export const sendError = ({
    res,
    error,
    reportError,
    code = 400,
    resource,
    action,
    plural,
    message,
}: SendErrorOptions) => {
    if (reportError) console.error(reportError);
    if (error) return res.status(code).json(z.flattenError(error));

    if (reportError instanceof BaseError) {
        return res
            .status(reportError.status)
            .json({ error: reportError.message });
    }

    if (message) return res.status(code).json({ error: message });

    if (resource && action) {
        return res
            .status(code)
            .json({ error: buildErrorMessage(resource, action, plural) });
    }

    return res.status(code).json({ error: ErrorMessages.SERVER_ERROR });
};

export const sendUnauthorizedError = (res: Response) => {
    return sendError({ res, code: 401, message: ErrorMessages.UNAUTHORIZED });
};

export const sendForbiddenError = (res: Response) => {
    return sendError({ res, code: 403, message: ErrorMessages.FORBIDDEN });
};
