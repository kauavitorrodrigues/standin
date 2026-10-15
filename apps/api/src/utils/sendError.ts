import type { Response } from "express";
import { z, type ZodError } from "zod/v4";
import {
    AreaValidationError,
    BaseError,
    LayoutValidationError,
    LibraryError,
    LibraryValidationError,
    LockNotHeldError,
    MapLockedError,
    PublishTooManyOpsError,
    PublishValidationError,
    StaleLayoutVersionError,
} from "@standin/contracts";
import { ErrorMessages } from "@/enums/errorMessages";
import {
    ACTION_LABELS,
    RESOURCE_LABELS,
    type Action,
    type Resource,
} from "@standin/auth";

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

    // Layout validation answers with every error and warning, and a stale
    // layout with the version to reload.
    if (reportError instanceof LayoutValidationError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            errors: reportError.errors,
            warnings: reportError.warnings,
        });
    }
    
    // An area upload answers with the same shape as the library.
    if (reportError instanceof AreaValidationError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
            errors: reportError.errors,
            warnings: reportError.warnings,
        });
    }

    // The library answers with the same shape, and its other errors with
    // their code and details.
    if (reportError instanceof LibraryValidationError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
            errors: reportError.errors,
            warnings: reportError.warnings,
        });
    }
    
    if (reportError instanceof LibraryError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
            ...reportError.details,
        });
    }
    
    if (reportError instanceof StaleLayoutVersionError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
            version: reportError.currentVersion,
        });
    }
    
    // A locked map answers 423 with who holds the lock and since when.
    if (reportError instanceof MapLockedError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
            by: reportError.by,
            since: reportError.since,
        });
    }
    
    // A draft that cannot be applied answers with the operation that failed.
    if (reportError instanceof PublishValidationError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
            errors: reportError.errors,
        });
    }

    if (reportError instanceof PublishTooManyOpsError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
        });
    }

    if (reportError instanceof LockNotHeldError) {
        return res.status(reportError.status).json({
            error: reportError.message,
            code: reportError.code,
        });
    }

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
