import type { Response } from "express";
import { AreaListQuerySchema } from "@standin/contracts";
import { AreaService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listLibraryAreas = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.libraryScope) return;
        const query = parseSchema(AreaListQuerySchema, req.query, res);
        if (!query) return;

        const areas = await AreaService.list(
            req.libraryScope.organizationId,
            query
        );
        res.status(200).json({ areas, total: areas.length });
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
