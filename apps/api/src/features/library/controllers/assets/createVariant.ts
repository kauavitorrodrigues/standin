import type { Response } from "express";
import { CreateVariantDataSchema } from "@standin/contracts";
import { AssetService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readUploadParts } from "../../utils/readUploadParts";

export const createLibraryVariant = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user || !req.libraryScope) return;
        const params = parseSchema(paramsSchema("baseId"), req.params, res);
        if (!params) return;
        const { image, data } = readUploadParts(req, CreateVariantDataSchema);

        const asset = await AssetService.createVariant(
            params.baseId,
            image,
            data,
            {
                organizationId: req.libraryScope.organizationId,
                createdBy: req.user.id,
            }
        );
        res.status(201).json({ asset });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "create",
            reportError: error,
        });
    }
};
