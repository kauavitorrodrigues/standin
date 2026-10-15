import type { Response } from "express";
import { AreaService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readAreaParts } from "../../utils/readAreaParts";

export const replaceLibraryArea = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.libraryScope) return;
        const params = parseSchema(paramsSchema("areaId"), req.params, res);
        if (!params) return;
        const { image, data } = readAreaParts(req);

        const area = await AreaService.replace(
            params.areaId,
            req.libraryScope.organizationId,
            image,
            data
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
