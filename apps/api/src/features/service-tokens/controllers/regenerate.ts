import type { Request, Response } from "express";
import { ServiceTokenService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";

export const regenerateServiceToken = async (req: Request, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("id"), req.params, res);
        if (!params) return;

        const created = await ServiceTokenService.regenerate(params.id);
        // Carries the new clear token, so it must not be cached.
        res.set("Cache-Control", "no-store");
        res.status(200).json(created);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
