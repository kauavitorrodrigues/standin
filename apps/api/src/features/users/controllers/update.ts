import type { Response } from "express";
import { UserUpdateSchema } from "@standin/contracts";
import { UserService } from "@standin/core";
import { validateBody } from "@/utils/validateBody";
import type { ExtendedRequest } from "@/types/request";
import { sendUpdateUserError } from "../utils/actionError";

export const updateUser = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const data = validateBody(UserUpdateSchema, req.body, res);
        if (!data) return;

        const user = await UserService.update(req.user.id, data);
        res.status(200).json({ user });
    } catch (error) {
        return sendUpdateUserError(res, error);
    }
};
