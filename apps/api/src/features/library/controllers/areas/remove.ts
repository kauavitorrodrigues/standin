import type { Response } from "express";
import { AreaService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const removeLibraryArea = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("areaId"), req.params, res);
        if (!params) return;

        await AreaService.delete(
            params.areaId,
            req.libraryScope.organizationId
        );
        res.status(204).end();
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "delete",
            reportError: error,
        });
    }
};
