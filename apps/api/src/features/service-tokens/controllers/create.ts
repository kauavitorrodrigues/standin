import type { Response } from "express";
import { ServiceTokenCreateSchema } from "@standin/contracts";
import { ServiceTokenService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";

export const createServiceToken = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user) return;

        const data = parseSchema(ServiceTokenCreateSchema, req.body, res);
        if (!data) return;

        const created = await ServiceTokenService.create(req.user.id, data);
        // The only answer that carries the clear token. It must not be cached.
        res.set("Cache-Control", "no-store");
        res.status(201).json(created);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
