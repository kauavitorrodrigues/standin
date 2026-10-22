import type { NextFunction, Response } from "express";
import { ErrorMessages } from "@/enums/errorMessages";
import type { ExtendedRequest } from "@/types/request";
import { sendError } from "@/utils/sendError";

type RateLimitOptions = {
    windowMs: number;
    max: number;
};

type Window = { count: number; resetAt: number };

/**
 * A fixed window per person (per address when nobody is signed in), in memory.
 * Enough to slow down someone guessing invite tokens or spamming requests on
 * one server. Each limiter keeps its own counts.
 */
export const RateLimit = ({ windowMs, max }: RateLimitOptions) => {
    const windows = new Map<string, Window>();
    let nextSweepAt = 0;

    // The windows that ended are dropped now and then, so the map does not grow
    // for ever, without walking it on every request.
    const sweep = (now: number) => {
        if (now < nextSweepAt) return;

        nextSweepAt = now + windowMs;
        for (const [key, window] of windows) {
            if (window.resetAt <= now) windows.delete(key);
        }
    };

    const readWindow = (key: string, now: number): Window => {
        const stored = windows.get(key);
        if (stored && stored.resetAt > now) return stored;

        const fresh: Window = { count: 0, resetAt: now + windowMs };
        windows.set(key, fresh);
        return fresh;
    };

    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const now = Date.now();
        sweep(now);

        const key = req.user?.id ?? req.ip ?? "unknown";
        const window = readWindow(key, now);
        window.count += 1;

        if (window.count > max) {
            const waitSeconds = Math.ceil((window.resetAt - now) / 1000);
            res.set("Retry-After", String(waitSeconds));
            return sendError({
                res,
                code: 429,
                message: ErrorMessages.TOO_MANY_REQUESTS,
            });
        }
        next();
    };
};
