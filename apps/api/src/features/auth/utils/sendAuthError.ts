import type { Response } from "express";
import { BaseError } from "@standin/contracts";
import { sendError } from "@/utils/sendError";
import { ErrorMessages } from "@/enums/errorMessages";

export const sendInvalidCredentialsError = (res: Response) => {
    return sendError({
        res,
        code: 401,
        message: ErrorMessages.INVALID_CREDENTIALS,
    });
};

export const sendSignUpError = (res: Response, error?: unknown) => {
    if (error instanceof BaseError) {
        return sendError({
            res,
            code: error.status,
            message: error.message,
            reportError: error,
        });
    }
    return sendError({ res, message: ErrorMessages.SIGNUP, reportError: error });
};

export const sendSignInError = (res: Response, error?: unknown) => {
    return sendError({ res, message: ErrorMessages.SIGNIN, reportError: error });
};
