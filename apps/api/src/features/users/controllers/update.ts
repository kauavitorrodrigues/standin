import type { Response } from "express";
import { UserUpdateSchema } from "@standin/contracts";
import { UserService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const updateUser = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const data = parseSchema(UserUpdateSchema, req.body, res);
        if (!data) return;

        const user = await UserService.update(req.user.id, data);
        res.status(200).json({ user });
    } catch (error) {
        return sendError({ res, resource: "user", action: "update", reportError: error });
    }
};
