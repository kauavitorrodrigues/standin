import type { Request, Response } from "express";
import { ServiceTokenService } from "@standin/core";
import { sendError } from "@/utils/sendError";

export const listServiceTokens = async (_req: Request, res: Response) => {
    try {
        const serviceTokens = await ServiceTokenService.list();
        res.status(200).json({ serviceTokens });
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
