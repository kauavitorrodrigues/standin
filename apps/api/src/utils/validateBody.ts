import type { ZodType } from "zod/v4";
import type { Response } from "express";
import { sendError } from "@/utils/sendError";

export const validateBody = <T>(
    schema: ZodType<T>,
    data: unknown,
    res: Response,
): T | null => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        sendError({ res, error: parsed.error });
        return null;
    }
    return parsed.data;
};
