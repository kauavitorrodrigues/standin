import type { Response } from "express";
import { UserService } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { sendDeleteUserError } from "../utils/actionError";

export const deleteUser = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        await UserService.delete(req.user.id);

        res.clearCookie("token");
        res.sendStatus(200);
    } catch (error) {
        return sendDeleteUserError(res, error);
    }
};
