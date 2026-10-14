import type { Response } from "express";
import { AreaService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const renameLibraryArea = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("areaId"), req.params, res);
        if (!params) return;

        const area = await AreaService.rename(
            params.areaId,
            req.libraryScope.organizationId,
            req.body?.name
        );
        res.status(200).json({ area });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "update",
            reportError: error,
        });
    }
};
