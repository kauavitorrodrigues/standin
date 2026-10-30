import type { Response } from "express";
import { OrganizationInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const previewInvite = async (req: ExtendedRequest, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("token"), req.params, res);
        if (!params) return;

        const invite = await OrganizationInviteService.preview(params.token);
        res.status(200).json({ invite });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
