import type { Response } from "express";
import {
    AvatarCategoryParamsSchema,
    AvatarCategoryPartsQuerySchema,
} from "@standin/contracts";
import { AvatarService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listAvatarCategoryParts = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        const params = parseSchema(AvatarCategoryParamsSchema, req.params, res);
        if (!params) return;
        const query = parseSchema(
            AvatarCategoryPartsQuerySchema,
            req.query,
            res
        );
        if (!query) return;

        const page = await AvatarService.listCategoryParts({
            slot: params.slot,
            cursor: query.cursor,
            limit: query.limit,
        });
        res.status(200).json(page);
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
