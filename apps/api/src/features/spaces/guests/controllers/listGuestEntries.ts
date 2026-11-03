import type { Response } from "express";
import { SpaceGuestEntriesQuerySchema } from "@standin/contracts";
import { SpaceGuestService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { sendError } from "@/utils/sendError";
import type { ExtendedRequest } from "@/types/request";

export const listGuestEntries = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.user || !req.spaceRef) return;

        const query = parseSchema(SpaceGuestEntriesQuerySchema, req.query, res);
        if (!query) return;

        const result = await SpaceGuestService.listEntries(
            req.spaceRef.id,
            query
        );
        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "space",
            action: "read",
            plural: true,
            reportError: error,
        });
    }
};
