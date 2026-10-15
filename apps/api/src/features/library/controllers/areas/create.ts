import type { Response } from "express";
import { AreaService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";
import { readAreaParts } from "../../utils/readAreaParts";

export const createLibraryArea = async (
    req: ExtendedRequest,
    res: Response
) => {
    try {
        if (!req.user || !req.libraryScope) return;
        const { image, data } = readAreaParts(req);

        const area = await AreaService.create(image, data, {
            organizationId: req.libraryScope.organizationId,
            createdBy: req.user.id,
        });
        res.status(201).json({ area });
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "create",
            reportError: error,
        });
    }
};
