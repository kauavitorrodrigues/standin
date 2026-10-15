import type { Response } from "express";
import { DeskService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listDesks = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("spaceId"), req.params, res);
        if (!params) return;

        const desks = await DeskService.list(params.spaceId);
        res.status(200).json({ desks });
    } catch (error) {
        return sendError({
            res,
            resource: "user",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
