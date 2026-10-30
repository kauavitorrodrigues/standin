import type { Request, Response } from "express";
import { ServiceTokenService } from "@standin/core";
import { paramsSchema } from "@/utils/paramsSchema";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";

export const removeServiceToken = async (req: Request, res: Response) => {
    try {
        const params = parseSchema(paramsSchema("id"), req.params, res);
        if (!params) return;

        await ServiceTokenService.remove(params.id);
        res.status(204).send();
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
