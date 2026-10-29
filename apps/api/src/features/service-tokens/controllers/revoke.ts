import type { Request, Response } from "express";
import { ServiceTokenService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";

export const revokeServiceToken = async (req: Request, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("id"), req.params, res);
        if (!params) return;

        const serviceToken = await ServiceTokenService.revoke(params.id);
        res.status(200).json({ serviceToken });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
