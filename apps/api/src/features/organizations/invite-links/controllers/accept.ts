import type { Response } from "express";
import { OrganizationInvitationService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

// A person who already has an account takes an invitation by e-mail.
export const acceptInvitation = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user) return;

        const params = parseSchema(paramsSchema("token"), req.params, res);
        if (!params) return;

        const result = await OrganizationInvitationService.accept(
            req.user.id,
            params.token
        );
        res.status(200).json(result);
    } catch (error) {
        return sendError({ res, reportError: error });
    }
};
