import type { Response } from "express";
import { AvatarService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteAvatarPart = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("partId"), req.params, res);
        if (!params) return;

        await AvatarService.deletePart(params.partId);
        res.status(204).send();
    } catch (error) {
        return sendError({
            res,
            resource: "asset",
            action: "delete",
            reportError: error,
        });
    }
};
