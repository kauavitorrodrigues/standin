import type { Response } from "express";
import { SpaceInviteLinkCreateSchema } from "@standin/contracts";
import { SpaceInviteService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const createInviteLink = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.spaceRef) return;

        const data = parseSchema(
            SpaceInviteLinkCreateSchema,
            req.body ?? {},
            res
        );
        if (!data) return;

        const link = await SpaceInviteService.create(
            req.spaceRef.id,
            req.user.id,
            data
        );
        res.status(201).json({ link });
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "create",
            reportError: error,
        });
    }
};
