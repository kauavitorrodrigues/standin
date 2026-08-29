import type { Response } from "express";
import { UserService } from "@standin/core";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const deleteUser = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        await UserService.delete(req.user.id);

        res.clearCookie("token");
        res.sendStatus(200);
    } catch (error) {
        return sendError({ res, resource: "user", action: "delete", reportError: error });
    }
};
