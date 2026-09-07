import type { Response } from "express";
import { SpaceDataSchema } from "@standin/contracts";
import { SpaceService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createSpace = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(
            paramsSchema("organizationId"),
            req.params,
            res
        );
        if (!params) return;

        const data = parseSchema(SpaceDataSchema, req.body, res);
        if (!data) return;

        const space = await SpaceService.create(
            params.organizationId,
            req.user.id,
            data
        );
        res.status(201).json({ space });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "create",
            reportError: error,
        });
    }
};
